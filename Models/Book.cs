using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Text.Json.Serialization;

namespace ELibrary.Models
{
    public class Book
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [JsonIgnore]
        public string OwnerId { get; set; }

        [BsonRepresentation(BsonType.ObjectId)]
        [JsonIgnore]
        public string FileId { get; set; }


        public string Title { get; set; }
        public string Author { get; set; }
        public string[] Tags { get; set; }
        public bool Private { get; set; }
    }
}
