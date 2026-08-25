using ghaffaricredit_backend.Enum;
namespace ghaffaricredit_backend.Models
{
    public class Credit
    {
        public int Id { get; set; }
        public int PersonId { get; set; }
        public decimal Amount { get; set; }
        public CreditStatus Status { get; set; } = CreditStatus.NotPaid;
        public string? Notes { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Person? Person { get; set; } 
    }
}