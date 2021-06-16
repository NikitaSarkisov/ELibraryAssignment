using System.ComponentModel.DataAnnotations;

namespace ELibrary.Dto
{
    public class BookCreateUpdateDto
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public string Author { get; set; }
        [Required]
        public string Tags { get; set; }
        [Required]
        public bool Private { get; set; }
    }
}
