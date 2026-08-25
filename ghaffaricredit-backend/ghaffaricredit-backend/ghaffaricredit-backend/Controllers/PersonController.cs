using ghaffaricredit_backend.DTOs;
using ghaffaricredit_backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace ghaffaricredit_backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PersonController : ControllerBase
    {
        private readonly IPersonService _personService;

        public PersonController(IPersonService personService)
        {
            _personService = personService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPersons()
        {
            var persons = await _personService.GetAllPersons();
            return Ok(persons);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPersonById(int id)
        {
            var person = await _personService.GetPersonById(id);
            if (person == null)
                return NotFound($"Person with ID {id} not found");
            return Ok(person);
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchPersonsByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                return BadRequest("Name parameter is required");

            var persons = await _personService.SearchPersonsByName(name);
            return Ok(persons);
        }

        [HttpPost]
        public async Task<IActionResult> CreatePerson([FromBody] CreatePersonDto personDto)
        {
            if (string.IsNullOrWhiteSpace(personDto.Name))
                return BadRequest("Name is required");

            var createdPerson = await _personService.CreatePerson(personDto);
            return CreatedAtAction(nameof(GetPersonById), new { id = createdPerson.Id }, createdPerson);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdatePerson(int id, [FromBody] UpdatePersonDto personDto)
        {
            var updatedPerson = await _personService.UpdatePerson(id, personDto);
            if (updatedPerson == null)
                return NotFound($"Person with ID {id} not found");
            return Ok(updatedPerson);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePerson(int id)
        {
            var result = await _personService.DeletePerson(id);
            if (!result)
                return NotFound($"Person with ID {id} not found");
            return NoContent();
        }
    }
}