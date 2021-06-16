using System.ComponentModel.DataAnnotations;

namespace ELibrary.Models
{
    public class RegisterRequest
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
