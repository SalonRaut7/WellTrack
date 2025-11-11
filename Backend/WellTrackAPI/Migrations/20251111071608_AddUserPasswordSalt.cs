using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WellTrackAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserPasswordSalt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "StepsEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "SleepEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "MoodEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "HydrationEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "HabitEntries",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Username = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    PasswordSalt = table.Column<string>(type: "text", nullable: false),
                    EmailConfirmed = table.Column<bool>(type: "boolean", nullable: false),
                    Role = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StepsEntries_UserId",
                table: "StepsEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_SleepEntries_UserId",
                table: "SleepEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MoodEntries_UserId",
                table: "MoodEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HydrationEntries_UserId",
                table: "HydrationEntries",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_HabitEntries_UserId",
                table: "HabitEntries",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_HabitEntries_Users_UserId",
                table: "HabitEntries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HydrationEntries_Users_UserId",
                table: "HydrationEntries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_MoodEntries_Users_UserId",
                table: "MoodEntries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_SleepEntries_Users_UserId",
                table: "SleepEntries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_StepsEntries_Users_UserId",
                table: "StepsEntries",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_HabitEntries_Users_UserId",
                table: "HabitEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_HydrationEntries_Users_UserId",
                table: "HydrationEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_MoodEntries_Users_UserId",
                table: "MoodEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_SleepEntries_Users_UserId",
                table: "SleepEntries");

            migrationBuilder.DropForeignKey(
                name: "FK_StepsEntries_Users_UserId",
                table: "StepsEntries");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropIndex(
                name: "IX_StepsEntries_UserId",
                table: "StepsEntries");

            migrationBuilder.DropIndex(
                name: "IX_SleepEntries_UserId",
                table: "SleepEntries");

            migrationBuilder.DropIndex(
                name: "IX_MoodEntries_UserId",
                table: "MoodEntries");

            migrationBuilder.DropIndex(
                name: "IX_HydrationEntries_UserId",
                table: "HydrationEntries");

            migrationBuilder.DropIndex(
                name: "IX_HabitEntries_UserId",
                table: "HabitEntries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "StepsEntries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "SleepEntries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "MoodEntries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "HydrationEntries");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "HabitEntries");
        }
    }
}
