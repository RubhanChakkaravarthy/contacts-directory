using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace ContactsAPI.DTOs
{
    public class MessageDto
    {
        public string Field { get; set; }
        public string Message { get; set; }
    }

    /// <summary>
    /// Generic response DTO to standardize API responses.
    /// </summary>
    /// <typeparam name="T">Type of data being returned</typeparam>
    public class ResponseDto<T>
    {
        /// <summary>
        /// Indicates whether the request was successful.
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// The data returned by the request. Will be null if the request failed.
        /// </summary>
        public T Data { get; set; }

        /// <summary>
        /// List of detailed error messages if applicable. Will be null if no detailed errors exist.
        /// </summary>
        public List<MessageDto> Errors { get; set; }

        /// <summary>
        /// HTTP status code for the response.
        /// </summary>
        public HttpStatusCode StatusCode { get; set; }

        /// <summary>
        /// Creates a successful response with data.
        /// </summary>
        /// <param name="data">The data to return</param>
        /// <returns>A success response containing the data</returns>
        public static ResponseDto<T> CreateSuccess(T data)
        {
            return new ResponseDto<T>
            {
                Success = true,
                Data = data,
                Errors = null,
                StatusCode = HttpStatusCode.OK
            };
        }

        public static ResponseDto<T> CreateSuccess(HttpStatusCode statusCode, T data)
        {
            return new ResponseDto<T>
            {
                Success = true,
                Data = data,
                Errors = null,
                StatusCode = statusCode
            };
        }

        /// <summary>
        /// Creates a failure response with an error message.
        /// </summary>
        /// <param name="errorMessage">The error message</param>
        /// <returns>A failure response with the error message</returns>
        public static ResponseDto<T> CreateError(HttpStatusCode statusCode, string errorMessage, string field = null)
        {
            return new ResponseDto<T>
            {
                Success = false,
                Data = default,
                Errors = new List<MessageDto>
                {
                    new() { Field = field, Message = errorMessage }
                },
                StatusCode = statusCode
            };
        }

        /// <summary>
        /// Creates a failure response with detailed error information.
        /// </summary>
        /// <param name="errorMessage">The main error message</param>
        /// <param name="errors">List of detailed error messages</param>
        /// <returns>A failure response with detailed error information</returns>
        public static ResponseDto<T> CreateError(HttpStatusCode statusCode,List<MessageDto> errors)
        {
            return new ResponseDto<T>
            {
                
                Success = false,
                Data = default,
                Errors = errors,
                StatusCode = statusCode
            };
        }

        public static ResponseDto<T> CreateError(ModelStateDictionary modelState)
        {
            var errors = modelState
                .Where(ms => ms.Value.Errors.Count > 0)
                .Select(ms => new MessageDto
                {
                    Field = ms.Key,
                    Message = ms.Value.Errors.First().ErrorMessage
                })
                .ToList();
            return new ResponseDto<T>
            {
                Success = false,
                Data = default,
                Errors = errors,
                StatusCode = HttpStatusCode.BadRequest
            };
        }
    }
}