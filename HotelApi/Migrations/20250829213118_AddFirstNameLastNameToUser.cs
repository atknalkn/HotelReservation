using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace HotelApi.Migrations
{
    /// <inheritdoc />
    public partial class AddFirstNameLastNameToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FirstName",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "LastName",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Gender",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IdentityNumber",
                table: "Users",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "AverageCleanlinessRating",
                table: "RoomTypes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageLocationRating",
                table: "RoomTypes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageOverallRating",
                table: "RoomTypes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageServiceRating",
                table: "RoomTypes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageValueRating",
                table: "RoomTypes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "RoomTypes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "TotalReviews",
                table: "RoomTypes",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "CommissionAmount",
                table: "Reservations",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "NetAmount",
                table: "Reservations",
                type: "numeric(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageCleanlinessRating",
                table: "Properties",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageLocationRating",
                table: "Properties",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageOverallRating",
                table: "Properties",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageServiceRating",
                table: "Properties",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageValueRating",
                table: "Properties",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Properties",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "TotalReviews",
                table: "Properties",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageCleanlinessRating",
                table: "Hotels",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageLocationRating",
                table: "Hotels",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageOverallRating",
                table: "Hotels",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageServiceRating",
                table: "Hotels",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "AverageValueRating",
                table: "Hotels",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Hotels",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "TotalReviews",
                table: "Hotels",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "CommissionSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CommissionRate = table.Column<decimal>(type: "numeric", nullable: false),
                    MinimumCommission = table.Column<decimal>(type: "numeric", nullable: false),
                    MaximumCommission = table.Column<decimal>(type: "numeric", nullable: false),
                    CalculationMethod = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    LastUpdated = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedByUserId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CommissionSettings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CommissionSettings_Users_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    HotelId = table.Column<int>(type: "integer", nullable: false),
                    PropertyId = table.Column<int>(type: "integer", nullable: true),
                    RoomTypeId = table.Column<int>(type: "integer", nullable: true),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    ReservationId = table.Column<int>(type: "integer", nullable: false),
                    OverallRating = table.Column<int>(type: "integer", nullable: false),
                    CleanlinessRating = table.Column<int>(type: "integer", nullable: false),
                    ServiceRating = table.Column<int>(type: "integer", nullable: false),
                    LocationRating = table.Column<int>(type: "integer", nullable: false),
                    ValueRating = table.Column<int>(type: "integer", nullable: false),
                    Comment = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AdminNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reviews", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Reviews_Hotels_HotelId",
                        column: x => x.HotelId,
                        principalTable: "Hotels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Properties_PropertyId",
                        column: x => x.PropertyId,
                        principalTable: "Properties",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Reservations_ReservationId",
                        column: x => x.ReservationId,
                        principalTable: "Reservations",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_RoomTypes_RoomTypeId",
                        column: x => x.RoomTypeId,
                        principalTable: "RoomTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Reviews_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CommissionSettings_IsActive_LastUpdated",
                table: "CommissionSettings",
                columns: new[] { "IsActive", "LastUpdated" });

            migrationBuilder.CreateIndex(
                name: "IX_CommissionSettings_UpdatedByUserId",
                table: "CommissionSettings",
                column: "UpdatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_HotelId_Status_CreatedAt",
                table: "Reviews",
                columns: new[] { "HotelId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_PropertyId_Status_CreatedAt",
                table: "Reviews",
                columns: new[] { "PropertyId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ReservationId",
                table: "Reviews",
                column: "ReservationId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_RoomTypeId_Status_CreatedAt",
                table: "Reviews",
                columns: new[] { "RoomTypeId", "Status", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId_CreatedAt",
                table: "Reviews",
                columns: new[] { "UserId", "CreatedAt" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CommissionSettings");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropColumn(
                name: "FirstName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "LastName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Gender",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "IdentityNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AverageCleanlinessRating",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "AverageLocationRating",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "AverageOverallRating",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "AverageServiceRating",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "AverageValueRating",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "TotalReviews",
                table: "RoomTypes");

            migrationBuilder.DropColumn(
                name: "CommissionAmount",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "NetAmount",
                table: "Reservations");

            migrationBuilder.DropColumn(
                name: "AverageCleanlinessRating",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "AverageLocationRating",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "AverageOverallRating",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "AverageServiceRating",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "AverageValueRating",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "TotalReviews",
                table: "Properties");

            migrationBuilder.DropColumn(
                name: "AverageCleanlinessRating",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "AverageLocationRating",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "AverageOverallRating",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "AverageServiceRating",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "AverageValueRating",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Hotels");

            migrationBuilder.DropColumn(
                name: "TotalReviews",
                table: "Hotels");
        }
    }
}
