using ghaffaricredit_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace ghaffaricredit_backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Person> Persons { get; set; }
        public DbSet<Credit> Credits { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Person>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<Credit>()
                .HasKey(c => c.Id);

            modelBuilder.Entity<Credit>()
                .HasOne(c => c.Person)
                .WithMany(p => p.Credits)
                .HasForeignKey(c => c.PersonId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}