using ghaffaricredit_backend.DTOs;

namespace ghaffaricredit_backend.Services
{
    public interface IPersonService
    {
        Task<IEnumerable<PersonDto>> GetAllPersons();
        Task<PersonDto?> GetPersonById(int id);
        Task<IEnumerable<PersonDto>> SearchPersonsByName(string name);
        Task<PersonDto> CreatePerson(CreatePersonDto personDto);
        Task<PersonDto?> UpdatePerson(int id, UpdatePersonDto personDto);
        Task<bool> DeletePerson(int id);
    }
}