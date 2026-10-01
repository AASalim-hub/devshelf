namespace server.Data;


using Microsoft.EntityFrameworkCore;
using server.Models;


public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Resource> Resources { get; set; }
    public DbSet<Snippet> Snippets { get; set; }
    public DbSet<DevTask> Tasks { get; set; }
}



