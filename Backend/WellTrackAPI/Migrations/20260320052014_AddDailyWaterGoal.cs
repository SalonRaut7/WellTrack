using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WellTrackAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyWaterGoal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DailyWaterGoalMl",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DailyWaterGoalMl",
                table: "AspNetUsers");
        }
    }
}
