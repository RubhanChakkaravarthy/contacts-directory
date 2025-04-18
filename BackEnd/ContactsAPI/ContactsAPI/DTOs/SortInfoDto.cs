using System;
using System.Text.Json.Serialization;
using ContactsAPI.Enums;

namespace ContactsAPI.DTOs
{
    public class SortInfoDto
    {
        public string SortBy { get; set; }
        public SortDirection SortDirection { get; set; }

        [JsonIgnore]
        public bool IsAscending => SortDirection == SortDirection.Ascending;
    }
}