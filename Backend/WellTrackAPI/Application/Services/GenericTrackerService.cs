using AutoMapper;
using Microsoft.Extensions.Logging;
using WellTrackAPI.Domain.Entities.Interfaces;
using WellTrackAPI.ExceptionHandling;
using WellTrackAPI.Infrastructure.Repositories.Interfaces;

namespace WellTrackAPI.Application.Services
{
    public class GenericTrackerService<TDto, TEntity> : IGenericTrackerService<TDto, TEntity>
        where TEntity : class, ITrackerEntity
    {
        private readonly IGenericRepository<TEntity> _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<GenericTrackerService<TDto, TEntity>> _logger;

        public GenericTrackerService(
            IGenericRepository<TEntity> repository,
            IMapper mapper,
            ILogger<GenericTrackerService<TDto, TEntity>> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<IEnumerable<TEntity>> GetAllAsync(string userId)
        {
            return await _repository.GetAllAsync(userId);
        }

        public async Task<TEntity> GetByIdAsync(int id, string userId)
        {
            var entity = await _repository.GetByIdAsync(id, userId);
            if (entity == null)
            {
                throw new NotFoundException($"{typeof(TEntity).Name} not found");
            }
            return entity;
        }

        public async Task<TEntity> CreateAsync(TDto dto, string userId)
        {
            var entity = _mapper.Map<TEntity>(dto);
            entity.UserId = userId;
            
            // Handle Date from DTO if it has one
            var dtoDateProperty = typeof(TDto).GetProperty("Date");
            if (dtoDateProperty != null)
            {
                var dateValue = dtoDateProperty.GetValue(dto);
                if (dateValue is DateTime dateTime)
                {
                    entity.Date = dateTime;
                }
                else if (dateValue != null && dateValue.GetType() == typeof(DateTime?))
                {
                    var nullableDateTime = (DateTime?)dateValue;
                    entity.Date = nullableDateTime ?? DateTime.UtcNow;
                }
                else
                {
                    entity.Date = DateTime.UtcNow;
                }
            }
            else
            {
                entity.Date = DateTime.UtcNow;
            }

            return await _repository.CreateAsync(entity);
        }

        public async Task<bool> UpdateAsync(int id, TDto dto, string userId)
        {
            var entity = await GetByIdAsync(id, userId);
            
            // Map DTO changes to entity (excluding UserId and Date for now)
            _mapper.Map(dto, entity);
            
            // Preserve UserId
            entity.UserId = userId;
            
            // Handle Date from DTO if provided
            var dtoDateProperty = typeof(TDto).GetProperty("Date");
            if (dtoDateProperty != null)
            {
                var dateValue = dtoDateProperty.GetValue(dto);
                if (dateValue is DateTime dateTime && dateTime != default)
                {
                    entity.Date = dateTime;
                }
                else if (dateValue != null && dateValue.GetType() == typeof(DateTime?))
                {
                    var nullableDateTime = (DateTime?)dateValue;
                    if (nullableDateTime.HasValue)
                    {
                        entity.Date = nullableDateTime.Value;
                    }
                }
            }

            await _repository.UpdateAsync(entity);
            return true;
        }

        public async Task<bool> DeleteAsync(int id, string userId)
        {
            var entity = await GetByIdAsync(id, userId);
            await _repository.DeleteAsync(entity);
            return true;
        }
    }
}
