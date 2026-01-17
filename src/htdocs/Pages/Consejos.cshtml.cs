using Microsoft.Data.SqlClient;
using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

public class ConsejosModel : PageModel
{
    private const string GeoApiUrl = "http://ip-api.com/json/";
    private static readonly HttpClient GeoClient = new();
    private readonly IConfiguration _configuration;

    public ConsejosModel(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    [BindProperty]
    public string? FirstName { get; set; }

    [BindProperty]
    public string? LastName { get; set; }

    [BindProperty]
    public string? Email { get; set; }

    public async Task<IActionResult> OnPostAsync()
    {
        var firstName = (FirstName ?? string.Empty).Trim();
        var lastName = (LastName ?? string.Empty).Trim();
        var email = (Email ?? string.Empty).Trim();

        if (string.IsNullOrWhiteSpace(firstName))
        {
            ModelState.AddModelError(nameof(FirstName), "Nombre requerido.");
        }

        if (string.IsNullOrWhiteSpace(lastName))
        {
            ModelState.AddModelError(nameof(LastName), "Apellido requerido.");
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            ModelState.AddModelError(nameof(Email), "Email requerido.");
        }
        else if (!Regex.IsMatch(email, @"^[^@\s]+@[^@\s]+\.[^@\s]+$"))
        {
            ModelState.AddModelError(nameof(Email), "Email invalido.");
        }

        if (!ModelState.IsValid)
        {
            return Page();
        }

        var connectionString = _configuration.GetConnectionString("DefaultConnection");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            ModelState.AddModelError(string.Empty, "Configuracion de base de datos no disponible.");
            return Page();
        }

        var clientIp = GetClientIp();
        var geo = await FetchGeoAsync(clientIp);

        try
        {
            await using var connection = new SqlConnection(connectionString);
            await connection.OpenAsync();

            const string sql = @"
INSERT INTO dbo.ConsejosSuscriptores
(
    FirstName,
    LastName,
    Email,
    CountryCode,
    Country,
    Region,
    City,
    Latitude,
    Longitude,
    IpAddress,
    CreatedAt
)
VALUES
(
    @FirstName,
    @LastName,
    @Email,
    @CountryCode,
    @Country,
    @Region,
    @City,
    @Latitude,
    @Longitude,
    @IpAddress,
    SYSUTCDATETIME()
);";

            await using var command = new SqlCommand(sql, connection);
            command.Parameters.AddWithValue("@FirstName", firstName);
            command.Parameters.AddWithValue("@LastName", lastName);
            command.Parameters.AddWithValue("@Email", email);
            command.Parameters.AddWithValue("@CountryCode", (object?)geo?.CountryCode ?? DBNull.Value);
            command.Parameters.AddWithValue("@Country", (object?)geo?.Country ?? DBNull.Value);
            command.Parameters.AddWithValue("@Region", (object?)geo?.Region ?? DBNull.Value);
            command.Parameters.AddWithValue("@City", (object?)geo?.City ?? DBNull.Value);
            command.Parameters.AddWithValue("@Latitude", geo?.Latitude ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@Longitude", geo?.Longitude ?? (object)DBNull.Value);
            command.Parameters.AddWithValue("@IpAddress", (object?)clientIp ?? DBNull.Value);

            await command.ExecuteNonQueryAsync();
        }
        catch
        {
            ModelState.AddModelError(string.Empty, "No pudimos guardar tus datos. Intentá más tarde.");
            return Page();
        }

        return RedirectToPage("/Default");
    }

    private string? GetClientIp()
    {
        var forwarded = Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(forwarded))
        {
            return forwarded.Split(',').FirstOrDefault()?.Trim();
        }

        return HttpContext.Connection.RemoteIpAddress?.ToString();
    }

    private async Task<GeoInfo?> FetchGeoAsync(string? ip)
    {
        try
        {
            var url = string.IsNullOrWhiteSpace(ip) ? GeoApiUrl : $"{GeoApiUrl}{ip}";
            using var response = await GeoClient.GetAsync($"{url}?fields=status,country,countryCode,regionName,city,lat,lon,query");
            if (!response.IsSuccessStatusCode) return null;

            var json = await response.Content.ReadAsStringAsync();
            var data = JsonSerializer.Deserialize<GeoResponse>(json);
            if (data is null || data.Status != "success") return null;

            return new GeoInfo(
                data.CountryCode,
                data.Country,
                data.RegionName,
                data.City,
                data.Lat,
                data.Lon);
        }
        catch
        {
            return null;
        }
    }

    private sealed record GeoResponse(
        string? Status,
        string? Country,
        string? CountryCode,
        string? RegionName,
        string? City,
        double? Lat,
        double? Lon);

    private sealed record GeoInfo(
        string? CountryCode,
        string? Country,
        string? Region,
        string? City,
        double? Latitude,
        double? Longitude);
}
