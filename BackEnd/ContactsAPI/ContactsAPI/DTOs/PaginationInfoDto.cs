using System;
using System.Collections.Generic;

namespace ContactsAPI.DTOs;

public class PaginationInfoDto
{
    public int CurrentPage { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public int TotalRecords { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalRecords / PageSize);
}