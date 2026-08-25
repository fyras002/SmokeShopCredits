using ghaffaricredit_backend.DTOs;
using ghaffaricredit_backend.Enum;
using ghaffaricredit_backend.Models;

namespace ghaffaricredit_backend.Services
{
    public interface ICreditService
    {
        Task<IEnumerable<CreditResponseDto>> GetAllCredits();
        Task<CreditResponseDto?> GetCreditById(int id);
        Task<IEnumerable<CreditResponseDto>> GetCreditsByPersonId(int personId);
        Task<CreditResponseDto> CreateCredit(CreateCreditDto creditDto);
        Task<CreditResponseDto?> UpdateCredit(int id, UpdateCreditDto creditDto);
        Task<bool> DeleteCredit(int id);
        Task<CreditResponseDto?> UpdateCreditStatus(int id, CreditStatus status);
    }
}