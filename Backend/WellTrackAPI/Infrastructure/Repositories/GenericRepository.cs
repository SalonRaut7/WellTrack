using Microsoft.EntityFrameworkCore;
using WellTrackAPI.Data;
using WellTrackAPI.Domain.Entities.Interfaces;
using WellTrackAPI.Infrastructure.Repositories.Interfaces;

namespace WellTrackAPI.Infrastructure.Repositories
{
    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class, ITrackerEntity
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<TEntity> _dbSet;

        public GenericRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<TEntity>();
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync(string userId)
        {
            return await _dbSet
                .Where(e => e.UserId == userId)
                .OrderByDescending(e => e.Date)
                .ToListAsync();
        }

        public async Task<TEntity?> GetByIdAsync(int id, string userId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId);
        }

        public async Task<TEntity> CreateAsync(TEntity entity)
        {
            _dbSet.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task UpdateAsync(TEntity entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(TEntity entity)
        {
            _dbSet.Remove(entity);
            await _context.SaveChangesAsync();
        }
    }
}
