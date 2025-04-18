using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ContactsAPI.Models;
using ContactsAPI.Services;
using ContactsAPI.DTOs;
using Microsoft.AspNetCore.JsonPatch;
using System.Net;

namespace ContactsAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ContactController : ApiControllerBase
    {
        private readonly IContactService _contactService;

        public ContactController(IContactService contactService)
        {
            _contactService = contactService;
        }

        // POST: api/Contact/Search
        [HttpPost("Search")]
        public async Task<ActionResult<ResponseDto<PaginatedDto<ContactListItemDto>>>> GetContacts([FromBody] ContactSearchCriteriaDto criteria)
        {
            var response = await _contactService.GetContactsByCriteriaAsync(criteria);
            return CreateActionResultFromResponse(response);
        }

        // GET api/Contact/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ResponseDto<Contact>>> GetContact(int id)
        {
            var response = await _contactService.GetContactByIdAsync(id);
            return CreateActionResultFromResponse(response);
        }

        // POST api/Contact
        [HttpPost]
        public async Task<ActionResult<ResponseDto<Contact>>> CreateContact([FromBody] Contact contact)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ResponseDto<Contact>.CreateError(ModelState));
            }

            var response = await _contactService.CreateContactAsync(contact);
            return CreateActionResultFromResponse(response);
        }

        // PATCH api/Contact/5
        [HttpPatch("{id}")]
        public async Task<ActionResult<ResponseDto<Contact>>> UpdateContact(int id, [FromBody] JsonPatchDocument<Contact> contactPatch)
        {
            if (contactPatch == null)
            {
                var errorResponse = ResponseDto<Contact>.CreateError(HttpStatusCode.BadRequest, "Patch document cannot be null");
                return BadRequest(errorResponse);
            }

            // Remove the generated and unmodifiable properties from the patch document to prevent them from being modified
            contactPatch.Operations.RemoveAll(o => o.path == "/createdOn" || o.path == "/updatedOn" || o.path == "/email" || o.path == "/id");


            // First, get the contact
            var contactResponse = await _contactService.GetContactByIdAsync(id);
            if (!contactResponse.Success)
            {
                return CreateActionResultFromResponse(contactResponse);
            }

            var contact = contactResponse.Data;

            // Apply the patch
            contactPatch.ApplyTo(contact);

            // Validate the model after applying the patch
            if (!TryValidateModel(contact))
            {
                return CreateActionResultFromResponse(ResponseDto<Contact>.CreateError(ModelState));
            }

            // Update the contact
            var updateResponse = await _contactService.UpdateContactAsync(id, contact);
            return CreateActionResultFromResponse(updateResponse);
        }

        // DELETE api/Contact/5
        [HttpDelete("{id}")]
        public async Task<ActionResult<ResponseDto<bool>>> DeleteContact(int id)
        {
            var response = await _contactService.DeleteContactAsync(id);
            return CreateActionResultFromResponse(response);
        }
    }
}
