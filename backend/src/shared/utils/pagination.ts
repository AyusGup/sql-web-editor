interface PaginationOptions {
    page?: number;
    limit?: number;
    sort?: any;
    projection?: any;
    populate?: any;
}

export async function paginate<T>(
    model: any,
    query: any = {},
    options: PaginationOptions = {}
) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 20);
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        model
            .find(query)
            .sort(options.sort || { createdAt: -1 })
            .select(options.projection)
            .populate(options.populate)
            .skip(skip)
            .limit(limit)
            .lean(),
        model.countDocuments(query),
    ]);

    return {
        data: data as T[],
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

export async function paginateAggregate<T>(
    model: any,
    basePipeline: any[] = [],
    postPaginationPipeline: any[] = [],
    options: { page?: number; limit?: number } = {}
) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 20);
    const skip = (page - 1) * limit;

    const [result] = await model.aggregate([
        ...basePipeline,
        {
            $facet: {
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    ...postPaginationPipeline
                ],
                total: [{ $count: "count" }],
            },
        },
    ]);

    const data = result.data as T[];
    const total = result.total[0]?.count || 0;

    return {
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

