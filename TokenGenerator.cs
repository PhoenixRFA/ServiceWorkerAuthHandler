using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace ServiceWorkerAuthHandler
{
    public static class TokenGenerator
    {
        public static SymmetricSecurityKey Key => new (Encoding.UTF8.GetBytes("abcdefghijklmnopqrstuvwxyz"));
        public static string Audience => "ServiceWorkerAuthHandlerApplication";
        public static string Issuer => "ServiceWorkerAuthHandlerServer";

        public static string Generate(string username)
        {
            var claims = new Claim[]
            {
                new Claim(ClaimTypes.Name, username)
            };

            var creds = new SigningCredentials(Key, SecurityAlgorithms.HmacSha256Signature);

            var token = new JwtSecurityToken
            (
                issuer: Issuer,
                audience: Audience,
                claims: claims,
                expires: DateTime.Today.AddMonths(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
