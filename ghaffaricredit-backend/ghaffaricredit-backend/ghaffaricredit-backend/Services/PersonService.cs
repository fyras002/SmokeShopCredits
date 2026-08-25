using ghaffaricredit_backend.Data;
using ghaffaricredit_backend.DTOs;
using ghaffaricredit_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace ghaffaricredit_backend.Services
{
    public class PersonService : IPersonService
    {
        private readonly ApplicationDbContext _context;

        public PersonService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<PersonDto>> GetAllPersons()
        {
            return await _context.Persons
                .Include(p => p.Credits)
                .Select(p => new PersonDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Phone = p.Phone,
                    Address = p.Address,
                    Notes = p.Notes,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    Credits = p.Credits.Select(c => new CreditDto
                    {
                        Id = c.Id,
                        PersonId = c.PersonId,
                        Amount = c.Amount,
                        Status = c.Status,
                        Notes = c.Notes,
                        CreatedAt = c.CreatedAt
                    }).ToList()
                })
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();
        }

        public async Task<PersonDto?> GetPersonById(int id)
        {
            return await _context.Persons
                .Include(p => p.Credits)
                .Where(p => p.Id == id)
                .Select(p => new PersonDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Phone = p.Phone,
                    Address = p.Address,
                    Notes = p.Notes,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    Credits = p.Credits.Select(c => new CreditDto
                    {
                        Id = c.Id,
                        PersonId = c.PersonId,
                        Amount = c.Amount,
                        Status = c.Status,
                        Notes = c.Notes,
                        CreatedAt = c.CreatedAt
                    }).ToList()
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<PersonDto>> SearchPersonsByName(string name)
        {
            return await _context.Persons
                .Include(p => p.Credits)
                .Where(p => p.Name.Contains(name))
                .Select(p => new PersonDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Phone = p.Phone,
                    Address = p.Address,
                    Notes = p.Notes,
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    Credits = p.Credits.Select(c => new CreditDto
                    {
                        Id = c.Id,
                        PersonId = c.PersonId,
                        Amount = c.Amount,
                        Status = c.Status,
                        Notes = c.Notes,
                        CreatedAt = c.CreatedAt
                    }).ToList()
                })
                .OrderBy(p => p.Name)
                .ToListAsync();
        }

        public async Task<PersonDto> CreatePerson(CreatePersonDto personDto)
        {
            var person = new Person
            {
                Name = personDto.Name,
                Phone = personDto.Phone,
                Address = personDto.Address,
                Notes = personDto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            _context.Persons.Add(person);
            await _context.SaveChangesAsync();

            return new PersonDto
            {
                Id = person.Id,
                Name = person.Name,
                Phone = person.Phone,
                Address = person.Address,
                Notes = person.Notes,
                CreatedAt = person.CreatedAt,
                Credits = new List<CreditDto>()
            };
        }

        public async Task<PersonDto?> UpdatePerson(int id, UpdatePersonDto personDto)
        {
            var existingPerson = await _context.Persons.FindAsync(id);
            if (existingPerson == null)
                return null;

            existingPerson.Name = personDto.Name;
            existingPerson.Phone = personDto.Phone;
            existingPerson.Address = personDto.Address;
            existingPerson.Notes = personDto.Notes;
            existingPerson.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return await GetPersonById(id);
        }

        public async Task<bool> DeletePerson(int id)
        {
            var person = await _context.Persons.FindAsync(id);
            if (person == null)
                return false;

            _context.Persons.Remove(person);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}