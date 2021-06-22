using ELibrary.Services;
using ELibrary.Settings;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System;
using System.Security.Cryptography;

namespace ELibrary
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.AllowAnyMethod();
                    builder.AllowAnyHeader();
                    builder.AllowAnyOrigin();
                });
            });

            services.AddControllers();

            services.AddSpaStaticFiles(configuration =>
            {
                configuration.RootPath = "ClientApp/build";
            });

            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "ELibrary", Version = "v1" });
            });

            services.Configure<DbSettings>(Configuration.GetSection("Database"));

            // Configure JWT Authentication
            JwtKey jwtKey = new JwtKey();
            using (var rngCsp = new RNGCryptoServiceProvider())
            {
                jwtKey.Key = new byte[64];
                rngCsp.GetBytes(jwtKey.Key);
            }
            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(opt =>
                {
                    opt.MapInboundClaims = false;
                    opt.RequireHttpsMetadata = false;
                    opt.TokenValidationParameters = new TokenValidationParameters()
                    {
                        ValidateAudience = false,
                        ValidateIssuer = false,
                        ClockSkew = TimeSpan.Zero,
                        IssuerSigningKey = new SymmetricSecurityKey(jwtKey.Key)
                    };
                });

            services.AddSingleton<IUserService, UserService>();
            services.AddSingleton<IBookService, BookService>();

            services.AddSingleton<JwtKey>(jwtKey);
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "ELibrary v1"));
            }

            app.UseStaticFiles();
            app.UseSpaStaticFiles();

            app.UseRouting();

            app.UseCors("AllowAll");

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });

            app.UseSpa(spa =>
            {
                spa.Options.SourcePath = "ClientApp";
            });
        }
    }
}
