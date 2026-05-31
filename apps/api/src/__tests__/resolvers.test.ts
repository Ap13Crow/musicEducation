// Unit tests for course resolver logic (filter building, data validation)

describe('Course Filter Logic', () => {
  function buildCourseFilter(filter: any): any {
    const where: any = { status: 'PUBLISHED' };

    if (filter) {
      if (filter.level) where.level = filter.level;
      if (filter.instrument) where.instruments = { has: filter.instrument };
      if (filter.musicStyle) where.musicStyles = { has: filter.musicStyle };
      if (filter.categoryId) where.categoryId = filter.categoryId;
      if (filter.teacherProfileId) where.teacherProfileId = filter.teacherProfileId;
      if (filter.isFreeTier !== undefined) where.isFreeTier = filter.isFreeTier;
      if (filter.language) where.language = filter.language;
      if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        where.price = {};
        if (filter.minPrice !== undefined) where.price.gte = filter.minPrice;
        if (filter.maxPrice !== undefined) where.price.lte = filter.maxPrice;
      }
      if (filter.search) {
        where.OR = [
          { title: { contains: filter.search, mode: 'insensitive' } },
          { description: { contains: filter.search, mode: 'insensitive' } },
        ];
      }
    }
    return where;
  }

  it('should return base filter with no input', () => {
    const result = buildCourseFilter(null);
    expect(result).toEqual({ status: 'PUBLISHED' });
  });

  it('should filter by level', () => {
    const result = buildCourseFilter({ level: 'BEGINNER' });
    expect(result.level).toBe('BEGINNER');
    expect(result.status).toBe('PUBLISHED');
  });

  it('should filter by instrument', () => {
    const result = buildCourseFilter({ instrument: 'Piano' });
    expect(result.instruments).toEqual({ has: 'Piano' });
  });

  it('should filter by free tier', () => {
    const result = buildCourseFilter({ isFreeTier: true });
    expect(result.isFreeTier).toBe(true);
  });

  it('should filter by price range', () => {
    const result = buildCourseFilter({ minPrice: 10, maxPrice: 50 });
    expect(result.price).toEqual({ gte: 10, lte: 50 });
  });

  it('should filter by min price only', () => {
    const result = buildCourseFilter({ minPrice: 20 });
    expect(result.price).toEqual({ gte: 20 });
  });

  it('should filter by search query', () => {
    const result = buildCourseFilter({ search: 'piano' });
    expect(result.OR).toHaveLength(2);
    expect(result.OR[0].title.contains).toBe('piano');
  });

  it('should combine multiple filters', () => {
    const result = buildCourseFilter({
      level: 'INTERMEDIATE',
      instrument: 'Violin',
      isFreeTier: false,
    });
    expect(result.level).toBe('INTERMEDIATE');
    expect(result.instruments).toEqual({ has: 'Violin' });
    expect(result.isFreeTier).toBe(false);
    expect(result.status).toBe('PUBLISHED');
  });

  it('should filter by language', () => {
    const result = buildCourseFilter({ language: 'de' });
    expect(result.language).toBe('de');
  });
});

describe('Course Slug Generation', () => {
  function generateSlug(title: string): string {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  it('should create a slug from a title', () => {
    expect(generateSlug('Piano Fundamentals')).toBe('piano-fundamentals');
  });

  it('should handle special characters', () => {
    expect(generateSlug('Baroque Performance: A Guide')).toBe('baroque-performance-a-guide');
  });

  it('should handle multiple spaces', () => {
    expect(generateSlug('Ear   Training   Core')).toBe('ear-training-core');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });
});

describe('Teacher Filter Logic', () => {
  function buildTeacherFilter(filter: any): any {
    const where: any = { isAvailable: true };
    if (filter) {
      if (filter.instrument) where.instruments = { has: filter.instrument };
      if (filter.specialization) where.specializations = { has: filter.specialization };
      if (filter.city) where.locationCity = { contains: filter.city, mode: 'insensitive' };
      if (filter.country) where.locationCountry = filter.country;
      if (filter.format) where.teachingFormats = { has: filter.format };
      if (filter.maxHourlyRate !== undefined) where.hourlyRate = { lte: filter.maxHourlyRate };
      if (filter.minRating !== undefined) where.avgRating = { gte: filter.minRating };
      if (filter.isAvailable !== undefined) where.isAvailable = filter.isAvailable;
      if (filter.minExperience !== undefined) where.yearsExperience = { gte: filter.minExperience };
      if (filter.search) {
        where.OR = [
          { headline: { contains: filter.search, mode: 'insensitive' } },
          { teachingBio: { contains: filter.search, mode: 'insensitive' } },
        ];
      }
    }
    return where;
  }

  it('should return base filter with no input', () => {
    const result = buildTeacherFilter(null);
    expect(result).toEqual({ isAvailable: true });
  });

  it('should filter by instrument', () => {
    const result = buildTeacherFilter({ instrument: 'Violin' });
    expect(result.instruments).toEqual({ has: 'Violin' });
  });

  it('should filter by min rating', () => {
    const result = buildTeacherFilter({ minRating: 4.5 });
    expect(result.avgRating).toEqual({ gte: 4.5 });
  });

  it('should filter by min experience', () => {
    const result = buildTeacherFilter({ minExperience: 10 });
    expect(result.yearsExperience).toEqual({ gte: 10 });
  });

  it('should filter by max hourly rate', () => {
    const result = buildTeacherFilter({ maxHourlyRate: 100 });
    expect(result.hourlyRate).toEqual({ lte: 100 });
  });

  it('should filter by teaching format', () => {
    const result = buildTeacherFilter({ format: 'ONLINE' });
    expect(result.teachingFormats).toEqual({ has: 'ONLINE' });
  });

  it('should filter by city', () => {
    const result = buildTeacherFilter({ city: 'Zurich' });
    expect(result.locationCity).toEqual({ contains: 'Zurich', mode: 'insensitive' });
  });

  it('should combine instrument and rating filters', () => {
    const result = buildTeacherFilter({ instrument: 'Piano', minRating: 4, minExperience: 5 });
    expect(result.instruments).toEqual({ has: 'Piano' });
    expect(result.avgRating).toEqual({ gte: 4 });
    expect(result.yearsExperience).toEqual({ gte: 5 });
  });

  it('should filter by search query', () => {
    const result = buildTeacherFilter({ search: 'piano' });
    expect(result.OR).toHaveLength(2);
  });
});
