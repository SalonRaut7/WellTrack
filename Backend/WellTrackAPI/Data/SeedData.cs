using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using WellTrackAPI.Models;

namespace WellTrackAPI.Data
{
    public static class SeedData
    {
        public static async Task SeedAdminAsync(IServiceProvider services)
        {
            using var scope = services.CreateScope();

            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var config = scope.ServiceProvider.GetRequiredService<IConfiguration>();

            // Read Admin credentials from appsettings.json
            var adminEmail = config["AdminUser:Email"]!;
            var adminPassword = config["AdminUser:Password"]!;

            // Ensure "Admin" role exists
            if (!await roleManager.RoleExistsAsync("Admin"))
                await roleManager.CreateAsync(new IdentityRole("Admin"));

            // Check if admin user exists
            var admin = await userManager.FindByEmailAsync(adminEmail);
            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Name = "Admin",
                    Email = adminEmail,
                    EmailConfirmed = true // optional: skip verification
                };

                var result = await userManager.CreateAsync(admin, adminPassword);
                if (result.Succeeded)
                    await userManager.AddToRoleAsync(admin, "Admin");
            }
            else
            {
                // Ensure admin is in Admin role
                if (!await userManager.IsInRoleAsync(admin, "Admin"))
                    await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}
