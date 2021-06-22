using ELibrary.Dto;
using ELibrary.Models;
using ELibrary.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace ELibrary.Controllers
{
    [Route("api/book")]
    [ApiController]
    [Authorize]
    public class BookController : ControllerBase
    {
        public readonly IBookService books;

        public BookController(IBookService books)
        {
            this.books = books;
        }

        [HttpPost("create")]
        public async Task<ActionResult<Book>> Create([FromForm] string book_info, IFormFile file)
        {
            // Get UserID from Inbound Claims
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userId == null) return BadRequest();

            // Deserialize book_info from FormData to BookDTO
            BookCreateUpdateDto bookDto;
            try
            {
                bookDto = JsonSerializer.Deserialize<BookCreateUpdateDto>(book_info, new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
            }
            catch (JsonException) { return BadRequest(); }

            if (file == null) { return BadRequest(); }

            // Create book and upload file to DB
            var book = await books.Create(userId.Value, bookDto, file.OpenReadStream());
            return StatusCode(201);
        }

        [HttpPut("update/{id}")]
        public async Task<ActionResult<Book>> Update(string id, [FromForm] string book_info, IFormFile file)
        {
            // Get UserID from Inbound Claims
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userId == null) return BadRequest();

            BookCreateUpdateDto bookDto;
            try
            {
                bookDto = JsonSerializer.Deserialize<BookCreateUpdateDto>(book_info, new JsonSerializerOptions() { PropertyNameCaseInsensitive = true });
            }
            catch (JsonException) { return BadRequest(); }

            if (file == null) { return BadRequest(); }

            // Update book values
            var book = await books.Update(id, userId.Value, bookDto, file.OpenReadStream());
            if (book == null) return NotFound();

            return StatusCode(201);
        }

        [HttpGet("list")]
        public async Task<IEnumerable<Book>> List()
        {
            // Get UserID from Inbound Claims
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userId == null) return null;

            return await books.GetAllPublic();
        }

        [HttpGet("listmy")]
        public async Task<IEnumerable<Book>> ListMy()
        {
            // Get user id from Inbound Claims
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userId == null) return null;

            return await books.GetByOwner(userId.Value);
        }

        [HttpGet("download/{id}")]
        public async Task<ActionResult> Download(string id)
        {
            // Get user id from Inbound Claims
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userId == null) return BadRequest();

            var stream = await books.Download(id, userId.Value);
            if (stream == null) return NotFound();

            return File(stream, "application/pdf");
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            // Get user id from Inbound Claims
            var userId = HttpContext.User.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub);
            if (userId == null) return BadRequest();

            var successful = await books.Delete(id, userId.Value);
            if (!successful) return NotFound();
            return Ok();
        }
    }
}
