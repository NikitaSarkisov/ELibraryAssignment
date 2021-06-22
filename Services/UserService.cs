using ELibrary.Models;
using ELibrary.Settings;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;

namespace ELibrary.Services
{
    public interface IUserService
    {
        AuthenticateResult Register(RegisterRequest register);
        AuthenticateResult Authenticate(LoginRequest login);
        AuthenticateResult Refresh(RefreshRequest refresh);
    }
    public class UserService : IUserService
    {
        private readonly IMongoCollection<User> users;
        private readonly JwtKey jwtKey;

        private const int AccessLifetime = 60; // 1 min
        private const int RefreshLifetime = 3600; // 1 hour

        public UserService(IOptions<DbSettings> dbSettings, JwtKey jwtKey)
        {
            this.jwtKey = jwtKey;

            var client = new MongoClient(dbSettings.Value.ConnectionString);
            var db = client.GetDatabase(dbSettings.Value.DatabaseName);
            users = db.GetCollection<User>("users");
        }

        public AuthenticateResult Register(RegisterRequest register)
        {
            // Check if the user already exists
            var user = users.Find(u => u.Name == register.Name).FirstOrDefault();
            if (user != null) return null;

            user = new User()
            {
                Name = register.Name,
                Password = register.Password
            };
            users.InsertOne(user);
            return authenticate(user);
        }

        public AuthenticateResult Authenticate(LoginRequest login)
        {
            // Find user by Name and Password
            var user = users.Find(u => u.Name == login.Name && u.Password == login.Password).FirstOrDefault();
            if (user == null) return null;

            return authenticate(user);
        }

        public AuthenticateResult Refresh(RefreshRequest refresh)
        {
            var userId = validateRefreshToken(refresh.RefreshToken);
            var user = users.Find(u => u.Id == userId).FirstOrDefault();
            if (user == null) return null;

            return authenticate(user);
        }


        private AuthenticateResult authenticate(User user)
        {
            // Generate access and refresh tokens
            var tokens = generateTokens(user);

            // Return tokens to client
            return new AuthenticateResult()
            {
                AccessToken = tokens[0],
                RefreshToken = tokens[1]
            };
        }
        private string[] generateTokens(User user)
        {
            ;
            var cred = new SigningCredentials(new SymmetricSecurityKey(jwtKey.Key), SecurityAlgorithms.HmacSha256);
            var handler = new JwtSecurityTokenHandler();

            var access_claims = new List<Claim>()
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Name, user.Name),
                new Claim("token_type", "access")
            };
            var refresh_claims = new List<Claim>()
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Name, user.Name),
                new Claim("token_type", "refresh")
            };



            return new string[]
            {
                handler.WriteToken(new JwtSecurityToken(claims: access_claims, expires: DateTime.Now.AddSeconds(AccessLifetime), signingCredentials: cred)),
                handler.WriteToken(new JwtSecurityToken(claims: refresh_claims, expires: DateTime.Now.AddSeconds(RefreshLifetime), signingCredentials: cred))
            };
        }
        private string validateRefreshToken(string token)
        {
            ClaimsPrincipal claims;
            var handler = new JwtSecurityTokenHandler() { MapInboundClaims = false };
            try
            {
                claims = handler.ValidateToken(token, new TokenValidationParameters()
                {
                    ValidateAudience = false,
                    ValidateIssuer = false,
                    ClockSkew = TimeSpan.Zero,
                    IssuerSigningKey = new SymmetricSecurityKey(jwtKey.Key)
                }, out _);
            }
            catch (SecurityTokenException)
            {
                return null;
            }
            var type = claims.FindFirst("token_type");
            if (type == null || type.Value != "refresh")
            {
                return null;
            }
            var id = claims.FindFirst(JwtRegisteredClaimNames.Sub);
            if (id == null || string.IsNullOrEmpty(type.Value))
            {
                return null;
            }
            return id.Value;
        }

    }
}
