using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using ServiceWorkerAuthHandler;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthorization();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opts => opts.TokenValidationParameters = new TokenValidationParameters {
        ValidAudience = TokenGenerator.Audience,
        ValidIssuer = TokenGenerator.Issuer,
        IssuerSigningKey = TokenGenerator.Key,
        AuthenticationType = JwtBearerDefaults.AuthenticationScheme
    });
    // Add services to the container.

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseDefaultFiles();
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/me", (HttpContext ctx) => ctx.User.Claims.Select(x => new { x.Type, x.Value }))
    .RequireAuthorization();
app.MapPost("/login", (LoginModel login) => TokenGenerator.Generate(login.Username));

app.Run();

internal record LoginModel(string Username);