using System.Collections.Generic;
using System.IO;
using System.Text.Json;
using ContactsAPI.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using System.Linq;

namespace ContactsAPI.Services
{
    public class ContactDbContext : DbContext
    {
        public ContactDbContext(DbContextOptions<ContactDbContext> options)
            : base(options)
        {
        }

        public DbSet<Contact> Contacts { get; set; }

        public DbSet<Contact.Address> Addresses { get; set; }

        public DbSet<Contact.EmergencyContact> EmergencyContacts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Contact>()
                .HasKey(c => c.Id);

            // Configure HomeAddress relationship
            modelBuilder.Entity<Contact>()
                .HasOne(c => c.HomeAddress)
                .WithOne()
                .HasForeignKey<Contact.Address>(a => a.ContactId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Contact>()
                .HasMany(c => c.EmergencyContacts)
                .WithOne()
                .HasForeignKey(ec => ec.ContactId)
                .IsRequired(true);

            LoadMockDataFromJson(modelBuilder);

            base.OnModelCreating(modelBuilder);
        }

        // Load mock json data from the Data folder
        private static void LoadMockDataFromJson(ModelBuilder modelBuilder) 
        {
            var jsonData = File.ReadAllText(Path.Combine(Directory.GetCurrentDirectory(), "Data", "Contacts.json"));
            var contacts = JsonSerializer.Deserialize<List<Contact>>(jsonData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            List<Contact.Address> addresses = new();
            List<Contact.EmergencyContact> emergencyContacts = new();

            // To give unique Id to each address and emergency contact
            int addressIdSequence = 1;
            int emergencyContactIdSequence = 1;
            foreach (var contact in contacts)
            {
                if (contact.HomeAddress != null)
                {
                    contact.HomeAddress.Id = addressIdSequence++;
                    contact.HomeAddress.ContactId = contact.Id;
                    addresses.Add(contact.HomeAddress);
                }

                if (contact.EmergencyContacts != null)
                {
                    foreach (var emergencyContact in contact.EmergencyContacts)
                    {
                        emergencyContact.Id = emergencyContactIdSequence++;
                        emergencyContact.ContactId = contact.Id;
                        emergencyContacts.Add(emergencyContact);
                    }
                }

                // Clear navigation properties to avoid serialization issues
                contact.HomeAddress = null;
                contact.EmergencyContacts = null;
            }

            modelBuilder.Entity<Contact>()
                .HasData(contacts);

            modelBuilder.Entity<Contact.Address>()
                .HasData(addresses);
            
            modelBuilder.Entity<Contact.EmergencyContact>()
                .HasData(emergencyContacts);
        }
    }
}