using Microsoft.EntityFrameworkCore;
using RiskMate.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using RiskMate.Api.Models;
using RiskMate.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var firebaseProjectId = builder.Configuration["Firebase:ProjectId"];
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://securetoken.google.com/{firebaseProjectId}";
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://securetoken.google.com/{firebaseProjectId}",
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") 
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddAuthorization();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddControllers();
builder.Services.AddHttpClient<YahooFinanceService>();
var app = builder.Build();


app.UseCors("AllowReactApp");
app.UseAuthentication();      
app.UseAuthorization();       
app.MapControllers();

app.MapGet("/", () => "RiskMate API is running!");

app.MapPost("/api/auth/sync", async (AppDbContext db, HttpContext httpContext) =>
{
    var firebaseUid = httpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
    var email = httpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ??
                httpContext.User.Claims.FirstOrDefault(c => c.Type == "email")?.Value;

    if (string.IsNullOrEmpty(firebaseUid))
        return Results.Unauthorized();

    var user = await db.Users.FirstOrDefaultAsync(u => u.FirebaseUid == firebaseUid);

    if (user == null)
    {
        user = new User
        {
            FirebaseUid = firebaseUid,
            Email = email ?? "no-email@provided.com",
            CreatedAt = DateTime.UtcNow
        };
        
        db.Users.Add(user);
        await db.SaveChangesAsync();
        
        return Results.Ok(new { Message = "Новий користувач успішно створений у БД", User = user });
    }

    return Results.Ok(new { Message = "Користувач вже існує", User = user });
}).RequireAuthorization();

app.Run();