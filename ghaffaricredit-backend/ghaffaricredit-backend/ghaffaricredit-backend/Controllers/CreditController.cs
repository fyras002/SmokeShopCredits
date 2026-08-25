using ghaffaricredit_backend.DTOs;
using ghaffaricredit_backend.Enum;
using ghaffaricredit_backend.Models;
using ghaffaricredit_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace ghaffaricredit_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CreditController : ControllerBase
    {
        private readonly ICreditService _creditService;

        public CreditController(ICreditService creditService)
        {
            _creditService = creditService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllCredits()
        {
            var credits = await _creditService.GetAllCredits();
            return Ok(credits);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCreditById(int id)
        {
            var credit = await _creditService.GetCreditById(id);
            if (credit == null)
                return NotFound($"Credit with ID {id} not found");
            return Ok(credit);
        }

        [HttpGet("person/{personId}")]
        public async Task<IActionResult> GetCreditsByPersonId(int personId)
        {
            var credits = await _creditService.GetCreditsByPersonId(personId);
            return Ok(credits);
        }

        [HttpPost]
        public async Task<IActionResult> CreateCredit([FromBody] CreateCreditDto creditDto)
        {
            if (creditDto.Amount <= 0)
                return BadRequest("Amount must be greater than 0");

            if (creditDto.PersonId <= 0)
                return BadRequest("PersonId is required");

            var createdCredit = await _creditService.CreateCredit(creditDto);
            return CreatedAtAction(nameof(GetCreditById), new { id = createdCredit.Id }, createdCredit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCredit(int id, [FromBody] UpdateCreditDto creditDto)
        {
            var updatedCredit = await _creditService.UpdateCredit(id, creditDto);
            if (updatedCredit == null)
                return NotFound($"Credit with ID {id} not found");
            return Ok(updatedCredit);
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateCreditStatus(int id, [FromBody] CreditStatus status)
        {
            var updatedCredit = await _creditService.UpdateCreditStatus(id, status);
            if (updatedCredit == null)
                return NotFound($"Credit with ID {id} not found");
            return Ok(updatedCredit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCredit(int id)
        {
            var result = await _creditService.DeleteCredit(id);
            if (!result)
                return NotFound($"Credit with ID {id} not found");
            return NoContent();
        }
    }
}