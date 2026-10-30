using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Medilog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class PatientAdminAndOwnership : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "Patients",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "DoctorId",
                table: "Patients",
                type: "TEXT",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<string>(
                name: "EmergencyContact",
                table: "Patients",
                type: "TEXT",
                maxLength: 300,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SecretaryDoctors",
                columns: table => new
                {
                    SecretaryId = table.Column<Guid>(type: "TEXT", nullable: false),
                    DoctorId = table.Column<Guid>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SecretaryDoctors", x => new { x.SecretaryId, x.DoctorId });
                    table.ForeignKey(
                        name: "FK_SecretaryDoctors_Users_DoctorId",
                        column: x => x.DoctorId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SecretaryDoctors_Users_SecretaryId",
                        column: x => x.SecretaryId,
                        principalTable: "Users",
                        principalColumn: "UserId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Patients_DoctorId",
                table: "Patients",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_SecretaryDoctors_DoctorId",
                table: "SecretaryDoctors",
                column: "DoctorId");

            // Existing databases predate patient ownership: give every existing patient to the clinic's
            // first doctor and assign every existing secretary to every doctor, which preserves the
            // clinic-wide access the old schema implied. A fresh database has no rows, so both are no-ops.
            migrationBuilder.Sql(
                """
                UPDATE "Patients"
                SET "DoctorId" = (SELECT "UserId" FROM "Users" WHERE "Role" = 'Doctor' ORDER BY "CreatedAt" LIMIT 1)
                WHERE "DoctorId" = '00000000-0000-0000-0000-000000000000'
                  AND EXISTS (SELECT 1 FROM "Users" WHERE "Role" = 'Doctor');
                """);

            migrationBuilder.Sql(
                """
                INSERT OR IGNORE INTO "SecretaryDoctors" ("SecretaryId", "DoctorId")
                SELECT s."UserId", d."UserId"
                FROM "Users" s
                JOIN "Users" d ON d."Role" = 'Doctor'
                WHERE s."Role" = 'Secretary';
                """);

            migrationBuilder.AddForeignKey(
                name: "FK_Patients_Users_DoctorId",
                table: "Patients",
                column: "DoctorId",
                principalTable: "Users",
                principalColumn: "UserId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Patients_Users_DoctorId",
                table: "Patients");

            migrationBuilder.DropTable(
                name: "SecretaryDoctors");

            migrationBuilder.DropIndex(
                name: "IX_Patients_DoctorId",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "DoctorId",
                table: "Patients");

            migrationBuilder.DropColumn(
                name: "EmergencyContact",
                table: "Patients");
        }
    }
}
