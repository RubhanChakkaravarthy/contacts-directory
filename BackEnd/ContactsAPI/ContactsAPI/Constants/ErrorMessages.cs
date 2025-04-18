using System;

namespace ContactsAPI.Constants
{
    /// <summary>
    /// Contains constant error messages used throughout the application
    /// </summary>
    public static class ErrorMessages
    {
        // Common messages
        public static string InternalServerError => "An unexpected error occurred.";
        
        // Contact validation errors
        public static string ContactCannotBeNull => "Contact cannot be null";
        public static string ContactIdMismatch => "Contact Id in path must match Id in the body";
        public static string InvalidId => "Id should be greater than zero";

        // Not found messages
        public static string ContactNotFound(int id) => $"Contact with Id {id} not found";

        // Operation specific errors
        public static string ErrorRetrievingContacts => "An error occurred while retrieving contacts";
        public static string ErrorRetrievingContact(int id) => $"An error occurred while retrieving contact with Id: {id}";
        public static string ErrorCreatingContact => "An error occurred while creating contact.";
        public static string ErrorUpdatingContact(int id) => $"An unexpected error occurred while updating the contact with ID: {id}";
        public static string ErrorDeletingContact(int id) => $"An unexpected error occurred while deleting the contact with ID: {id}";
    }
}