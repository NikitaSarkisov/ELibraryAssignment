using ELibrary.Dto;
using ELibrary.Models;
using ELibrary.Settings;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace ELibrary.Services
{
    public interface IBookService
    {
        Task<Book> Create(string ownerId, BookCreateUpdateDto book, Stream stream);
        Task<Book> Update(string bookId, string ownerId, BookCreateUpdateDto book, Stream stream);
        Task<IEnumerable<Book>> GetAllPublic();
        Task<IEnumerable<Book>> GetByOwner(string ownerId);
        Task<Stream> Download(string bookId, string ownerId);
        Task<bool> Delete(string bookId, string ownerId);
    }
    public class BookService : IBookService
    {
        private readonly IMongoCollection<Book> books;
        private readonly GridFSBucket files;

        public BookService(IOptions<DbSettings> dbSettings)
        {
            var client = new MongoClient(dbSettings.Value.ConnectionString);
            var db = client.GetDatabase(dbSettings.Value.DatabaseName);
            books = db.GetCollection<Book>("books");
            files = new GridFSBucket(db, new GridFSBucketOptions() { BucketName = "files" });
        }

        public async Task<Book> Create(string ownerId, BookCreateUpdateDto book, Stream stream)
        {
            var filename = Guid.NewGuid().ToString();
            var fileId = await files.UploadFromStreamAsync(filename, stream);

            var tags = book.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).Distinct().Select(t => t.Trim());
            var newBook = new Book
            {
                OwnerId = ownerId,
                FileId = fileId.ToString(),
                Title = book.Title,
                Author = book.Author,
                Tags = tags.ToArray(),
                Private = book.Private
            };

            await books.InsertOneAsync(newBook);
            return newBook;
        }

        public async Task<Book> Update(string bookId, string ownerId, BookCreateUpdateDto book, Stream stream)
        {
            try
            {
                // Find book
                Book bookToUpdate = await books.Find(b => b.OwnerId == ownerId && b.Id == bookId).FirstOrDefaultAsync();
                if (bookToUpdate == null) { return null; }

                // Delete file
                await files.DeleteAsync(ObjectId.Parse(bookToUpdate.FileId));

                // Upload new file
                var filename = Guid.NewGuid().ToString();
                var fileId = await files.UploadFromStreamAsync(filename, stream);

                // Set new values to book object
                var tags = book.Tags.Split(',', StringSplitOptions.RemoveEmptyEntries).Distinct().Select(t => t.Trim()).ToArray();
                var updateSet = Builders<Book>.Update
                    .Set(b => b.Title, book.Title)
                    .Set(b => b.Author, book.Author)
                    .Set(b => b.FileId, fileId.ToString())
                    .Set(b => b.Tags, tags)
                    .Set(b => b.Private, book.Private);
                var options = new FindOneAndUpdateOptions<Book, Book>() { ReturnDocument = ReturnDocument.After };
                bookToUpdate = await books.FindOneAndUpdateAsync<Book>(b => b.Id == bookId, updateSet, options);
                if (bookToUpdate == null) { return null; }

                return bookToUpdate;
            }
            catch (GridFSFileNotFoundException) { return null; }
            catch (FormatException) { return null; }
        }

        public async Task<IEnumerable<Book>> GetAllPublic()
        {
            return await books.Find(b => !b.Private).ToListAsync();
        }

        public async Task<IEnumerable<Book>> GetByOwner(string ownerId)
        {
            return await books.Find(b => b.OwnerId == ownerId).ToListAsync();
        }

        public async Task<Stream> Download(string bookId, string ownerId)
        {
            try
            {
                var book = await books.Find(b => b.Id == bookId && (!b.Private || b.OwnerId == ownerId)).FirstOrDefaultAsync();
                if (book == null) return null;
                return await files.OpenDownloadStreamAsync(ObjectId.Parse(book.FileId));
            }
            catch (GridFSFileNotFoundException) { return null; }
            catch (FormatException) { return null; }
        }

        public async Task<bool> Delete(string bookId, string ownerId)
        {
            try
            {
                var book = await books.FindOneAndDeleteAsync(b => b.OwnerId == ownerId && b.Id == bookId);
                if (book == null) return false;
                await files.DeleteAsync(ObjectId.Parse(book.FileId));
                return true;
            }
            catch (GridFSFileNotFoundException) { return false; }
            catch (FormatException) { return false; }
        }
    }
}
