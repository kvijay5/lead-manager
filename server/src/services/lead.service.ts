import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { AppError } from '../utils/AppError';
import {
  CreateLeadInput,
  ListLeadsQuery,
  UpdateLeadInput,
} from '../validation/lead.schemas';

export class LeadService {
  /**
   * Create a new lead for a specific authenticated user
   */
  async create(userId: string, input: CreateLeadInput) {
    // Check for duplicate email scoped to this user (case-insensitive)
    const existing = await prisma.lead.findFirst({
      where: {
        email: { equals: input.email, mode: 'insensitive' },
        userId,
      },
    });

    if (existing) {
      throw new AppError('A lead with this email already exists', 409, [
        { field: 'email', message: 'Email is already in use by another lead' },
      ]);
    }

    return prisma.lead.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone,
        company: input.company,
        source: input.source,
        status: input.status,
        userId,
      },
    });
  }

  /**
   * List leads for a specific authenticated user with filtering, searching, pagination, and sorting
   */
  async list(userId: string, query: ListLeadsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search && query.search.trim().length > 0) {
      const searchTerm = query.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { company: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.LeadOrderByWithRelationInput = {
      [query.sortBy || 'createdAt']: query.order || 'desc',
    };

    const [data, total] = await prisma.$transaction([
      prisma.lead.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  /**
   * Get a single lead by ID scoped to the authenticated user
   * Returns 404 if not found or belongs to another user
   */
  async getById(userId: string, id: string) {
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!lead) {
      throw new AppError(`Lead with ID '${id}' not found`, 404);
    }

    return lead;
  }

  /**
   * Update an existing lead scoped to the authenticated user
   */
  async update(userId: string, id: string, input: UpdateLeadInput) {
    const existing = await prisma.lead.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new AppError(`Lead with ID '${id}' not found`, 404);
    }

    // If email is changing, check for duplicates for this user (case-insensitive)
    if (
      input.email &&
      input.email.toLowerCase() !== existing.email.toLowerCase()
    ) {
      const duplicate = await prisma.lead.findFirst({
        where: {
          email: { equals: input.email, mode: 'insensitive' },
          userId,
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new AppError('A lead with this email already exists', 409, [
          {
            field: 'email',
            message: 'Email is already in use by another lead',
          },
        ]);
      }
    }

    return prisma.lead.update({
      where: { id },
      data: input,
    });
  }

  /**
   * Delete a lead by ID scoped to the authenticated user
   */
  async remove(userId: string, id: string) {
    const existing = await prisma.lead.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existing) {
      throw new AppError(`Lead with ID '${id}' not found`, 404);
    }

    await prisma.lead.delete({
      where: { id },
    });
  }

  /**
   * Get lead statistics for the authenticated user
   */
  async getStats(userId: string) {
    const where: Prisma.LeadWhereInput = {
      userId,
    };

    const [groups, total] = await prisma.$transaction([
      prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: {
          _all: true,
        },
        orderBy: {
          status: 'asc',
        },
      }),
      prisma.lead.count({ where }),
    ]);

    const byStatus = {
      NEW: 0,
      CONTACTED: 0,
      QUALIFIED: 0,
      LOST: 0,
    };

    groups.forEach((group) => {
      const count =
        typeof group._count === 'object' && group._count !== null
          ? ((group._count as { _all?: number })._all ?? 0)
          : 0;
      byStatus[group.status] = count;
    });

    return {
      total,
      byStatus,
    };
  }
}

export const leadService = new LeadService();
