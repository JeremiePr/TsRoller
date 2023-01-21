import * as express from 'express';
import * as cors from 'cors';
import { HttpMethods, ContentType, Controller } from './api-interface';
import { Server } from 'http';

export const app = express();
export const router = express.Router();

export const httpControllersCatalog: { [className: string]: string; } = {};
export const httpMethodsCatalog: { [className: string]: Array<{ name: string; argTypes: Array<string>; url: string; httpType: HttpMethods; contentType: ContentType; }>; } = {};
export const httpBodyParamsCatalog: Array<{ className: string; methodName: string; bodyParamIndex: number; }> = [];

export class ApiManager
{
    public static async run(
        port: number,
        afterServeCallback: (server: Server) => void = () => { },
        onApiErrors: (err: any) => void = () => { },
        apiInstances: Array<Controller>): Promise<void>
    {
        app.use(express.urlencoded({ extended: true }));
        app.use(express.json());
        app.use(cors());

        for (const apiInstance of apiInstances)
        {
            await this.buildControllerApi(apiInstance, onApiErrors);
        }

        const server = app.listen(port, () => afterServeCallback(server));

        app.use('/', router);
    }

    private static async buildControllerApi(apiInstance: any, onApiErrors: (err: any) => void): Promise<void>
    {
        if (!httpMethodsCatalog[apiInstance.constructor.name]) return;

        const controllerRoute = httpControllersCatalog[apiInstance.constructor.name] ?
            `/${httpControllersCatalog[apiInstance.constructor.name]}` : '';

        for (const entry of httpMethodsCatalog[apiInstance.constructor.name])
        {
            let response: any = null;
            let data: any = null;

            const route = `${controllerRoute}/${entry.url}`;

            switch (entry.contentType)
            {
                case ContentType.Data:
                    const httpMethod = this.getHttpMethod(apiInstance.constructor.name, entry.name, entry.argTypes, apiInstance, onApiErrors);
                    switch (entry.httpType)
                    {
                        case HttpMethods.Get: router.get(route, httpMethod); break;
                        case HttpMethods.Post: router.post(route, httpMethod); break;
                        case HttpMethods.Put: router.put(route, httpMethod); break;
                        case HttpMethods.Patch: router.patch(route, httpMethod); break;
                        case HttpMethods.Delete: router.delete(route, httpMethod); break;
                    }
                    break;

                case ContentType.File:
                    response = (apiInstance[entry.name] as (...args: any[]) => any).apply(apiInstance);
                    data = response instanceof Promise ? await response : response;
                    router.get(route, (_: any, res: any) => res.sendFile(data));
                    break;

                case ContentType.Directory:
                    response = (apiInstance[entry.name] as (...args: any[]) => any).apply(apiInstance);
                    data = response instanceof Promise ? await response : response;
                    router.use(route, express.static(data));
                    break;

                default:
                    throw new Error('Api method content type is not within the expected values');
            }
        }
    }

    private static getHttpMethod = (className: string, methodName: string, argTypes: Array<string>, apiInstance: any, onApiErrors: (err: any) => void): ((req: any, res: any) => void) =>
    {
        const baseMethod = apiInstance[methodName] as (...args: any[]) => any;
        const argNames = ApiManager.getMethodParametersNames(baseMethod.toString());
        const bodyParam = httpBodyParamsCatalog.filter(e => e.className === className && e.methodName === methodName)[0];
        const bodyParamIndex = bodyParam ? bodyParam.bodyParamIndex : null;

        return async (req: any, res: any) =>
        {
            try
            {
                const args = [];
                for (let index = 0; index < argNames.length; index++)
                {
                    let rawData: any;
                    if (index === bodyParamIndex)
                    {
                        args.push(req.body);
                    }
                    else
                    {
                        rawData = req.params[argNames[index]] ?? req.query[argNames[index]];
                        switch (argTypes[index])
                        {
                            case 'String':
                                args.push(rawData ? rawData as string : '');
                                break;
                            case 'Number':
                                args.push(rawData ? +rawData : 0);
                                break;
                            case 'Boolean':
                                args.push(rawData ? rawData === 'true' : false);
                                break;
                            default:
                                args.push(rawData);
                                break;
                        }
                    }
                }

                const response = baseMethod.apply(apiInstance, args);
                res.status(200).json(await response);
            }
            catch (err)
            {
                const error: any = err;
                res.status(500).json(error);
                if (onApiErrors) onApiErrors(error);
            }
        };
    }

    private static getMethodParametersNames(methodStr: string): Array<string>
    {
        return methodStr
            .slice(methodStr.indexOf('(') + 1, methodStr.indexOf(')'))
            .split(',')
            .map(argName => argName.trim());
    }
}
