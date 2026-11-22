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
   * Create a new lead
   */
  async create(input: CreateLeadInput) {
    // Check for duplicate email (case-insensitive, when userId is null)
    const existing = await prisma.lead.findFirst({
      where: {
        email: { equals: input.email, mode: 'insensitive' },
        userId: null,
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
        userId: null,
      },
    });
  }

  /**
   * List leads with filtering, searching, pagination, and sorting
   * - search: Case-insensitive match on name, email, or company
   * - status: Filter by specific LeadStatus enum
   * - pagination: 1-indexed page and limit with total count and totalPages
   * - sorting: Supports sortBy (name, createdAt, status, company) and order (asc, desc)
   */
  async list(query: ListLeadsQuery) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      userId: null,
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
   * Get a single lead by ID
   */
  async getById(id: string) {
    const lead = await prisma.lead.findFirst({
      where: {
        id,
        userId: null,
      },
    });

    if (!lead) {
      throw new AppError(`Lead with ID '${id}' not found`, 404);
    }

    return lead;
  }

  /**
   * Update an existing lead
   */
  async update(id: string, input: UpdateLeadInput) {
    const existing = await prisma.lead.findFirst({
      where: {
        id,
        userId: null,
      },
    });

    if (!existing) {
      throw new AppError(`Lead with ID '${id}' not found`, 404);
    }

    // If email is changing, check for duplicates (case-insensitive)
    if (
      input.email &&
      input.email.toLowerCase() !== existing.email.toLowerCase()
    ) {
      const duplicate = await prisma.lead.findFirst({
        where: {
          email: { equals: input.email, mode: 'insensitive' },
          userId: null,
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
   * Delete a lead by ID
   */
  async remove(id: string) {
    const existing = await prisma.lead.findFirst({
      where: {
        id,
        userId: null,
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
   * Get lead statistics: total leads count and counts per status
   */
  async getStats() {
    const where: Prisma.LeadWhereInput = {
      userId: null,
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
