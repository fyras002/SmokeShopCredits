using ghaffaricredit_backend.Enum;
using ghaffaricredit_backend.Models;

namespace ghaffaricredit_backend.DTOs
{
    public class CreateCreditDto
    {
        public int PersonId { get; set; }
        public decimal Amount { get; set; }
        public string? Notes { get; set; }
    }

    public class UpdateCreditDto
    {
        public decimal Amount { get; set; }
        public string? Notes { get; set; }
    }

    public class CreditResponseDto
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public string PersonName { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public CreditStatus Status { get; set; }
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}