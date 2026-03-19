import type { Request, Response, NextFunction } from 'express';
export declare function list(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function show(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function create(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function remove(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function send(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function accept(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function reject(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function convert(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function duplicate(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function downloadPdf(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function sendByEmail(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=quotes.controller.d.ts.map