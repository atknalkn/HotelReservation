using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HotelApi.Migrations
{
    /// <inheritdoc />
    public partial class AddHotelFieldsAndRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Hotels",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "OwnerUserId",
                table: "Hotels",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Hotels",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TaxNo",
                table: "Hotels",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Hotels_OwnerUserId",
                table: "Hotels",
                column: "OwnerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Hotels_TaxNo",
                table: "Hotels",
                column: "TaxNo",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Hotels_Users_OwnerUserId",
                table: "Hotels",
                column: "OwnerUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Hotels_Users_OwnerUserId",
                table: "Hotels");

            migrationBuilder.DropIndex(
                name: "IX_Hotels_OwnerUserId",
                table: "Hotels");

            migrationBuilder.DropIndex(
                name: "IX_Hotels_TaxNo",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "TaxNo",
                table: "Hotels");
        }
    }
}
