using System;
using System.Threading.Tasks;
using ContactsAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Net;

namespace ContactsAPI.Controllers
{
    /// <summary>
    /// Base controller providing common functionality for API controllers
    /// </summary>
    public abstract class ApiControllerBase : ControllerBase
    {
        /// <summary>
        /// Creates an ActionResult based on the ResponseDto status code and data
        /// </summary>
        /// <param name="response">The response DTO containing status and data</param>
        /// <returns>Appropriate ActionResult based on the response status</returns>
        protected ActionResult<ResponseDto<T>> CreateActionResultFromResponse<T>(ResponseDto<T> response)
        {
            if (response == null)
            {
                return NoContent();
            }

            return response.StatusCode switch
            {
                HttpStatusCode.OK => Ok(response),
                HttpStatusCode.NoContent => NoContent(),
                HttpStatusCode.BadRequest => BadRequest(response),
                HttpStatusCode.NotFound => NotFound(response),
                HttpStatusCode.InternalServerError => StatusCode((int)HttpStatusCode.InternalServerError, response),
                _ => StatusCode((int)response.StatusCode, response)
            };
        }
    }
}