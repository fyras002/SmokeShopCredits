using ghaffaricredit_backend.Data;
using ghaffaricredit_backend.DTOs;
using ghaffaricredit_backend.Enum;
using ghaffaricredit_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace ghaffaricredit_backend.Services
{
    public class CreditService : ICreditService
    {
        private readonly ApplicationDbContext _context;

        public CreditService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CreditResponseDto>> GetAllCredits()
        {
            return await _context.Credits
                .Include(c => c.Person)
                .Select(c => new CreditResponseDto
                {
                    Id = c.Id,
                    PersonId = c.PersonId,
                    PersonName = c.Person.Name,
                    Amount = c.Amount,
                    Status = c.Status,
                    Notes = c.Notes,
                    CreatedAt = c.CreatedAt
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<CreditResponseDto?> GetCreditById(int id)
        {
            return await _context.Credits
                .Include(c => c.Person)
                .Where(c => c.Id == id)
                .Select(c => new CreditResponseDto
                {
                    Id = c.Id,
                    PersonId = c.PersonId,
                    PersonName = c.Person.Name,
                    Amount = c.Amount,
                    Status = c.Status,
                    Notes = c.Notes,
                    CreatedAt = c.CreatedAt
                })
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<CreditResponseDto>> GetCreditsByPersonId(int personId)
        {
            return await _context.Credits
                .Include(c => c.Person)
                .Where(c => c.PersonId == personId)
                .Select(c => new CreditResponseDto
                {
                    Id = c.Id,
                    PersonId = c.PersonId,
                    PersonName = c.Person.Name,
                    Amount = c.Amount,
                    Status = c.Status,
                    Notes = c.Notes,
                    CreatedAt = c.CreatedAt
                })
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<CreditResponseDto> CreateCredit(CreateCreditDto creditDto)
        {
            var credit = new Credit
            {
                PersonId = creditDto.PersonId,
                Amount = creditDto.Amount,
                Notes = creditDto.Notes,
                Status = CreditStatus.NotPaid,
                CreatedAt = DateTime.UtcNow
            };

            _context.Credits.Add(credit);
            await _context.SaveChangesAsync();

            return await GetCreditById(credit.Id) ?? throw new Exception("Failed to retrieve created credit");
        }

        public async Task<CreditResponseDto?> UpdateCredit(int id, UpdateCreditDto creditDto)
        {
            var existingCredit = await _context.Credits.FindAsync(id);
            if (existingCredit == null)
                return null;

            existingCredit.Amount = creditDto.Amount;
            existingCredit.Notes = creditDto.Notes;
            if (existingCredit.Amount <= 0)
                existingCredit.Status = CreditStatus.Paid;

            await _context.SaveChangesAsync();
            return await GetCreditById(id);
        }

        public async Task<bool> DeleteCredit(int id)
        {
            var credit = await _context.Credits.FindAsync(id);
            if (credit == null)
                return false;

            _context.Credits.Remove(credit);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CreditResponseDto?> UpdateCreditStatus(int id, CreditStatus status)
        {
            var credit = await _context.Credits.FindAsync(id);
            if (credit == null)
                return null;

            credit.Status = status;
            await _context.SaveChangesAsync();
            return await GetCreditById(id);
        }
    }
}