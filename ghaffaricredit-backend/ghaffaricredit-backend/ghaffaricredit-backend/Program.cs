using ghaffaricredit_backend.Data;
using ghaffaricredit_backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString, npgsqlOptions =>
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null)));

builder.Services.AddScoped<IPersonService, PersonService>();
builder.Services.AddScoped<ICreditService, CreditService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:4200",
                    "https://ghaffaricredit-frontend.onrender.com")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// Only redirect to HTTPS in development.
// Render terminates SSL at its proxy, so this causes CORS/preflight issues in production.
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseRouting();

app.UseCors("AllowAngularApp");

app.UseAuthorization();

app.MapControllers();

app.Run();