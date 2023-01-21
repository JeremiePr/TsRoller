import 'reflect-metadata';
import * as apiManager from './api-manager';

export interface Controller { }

export enum HttpMethods
{
    Get,
    Post,
    Put,
    Patch,
    Delete
}

export enum ContentType
{
    Data,
    File,
    Directory
}

export const controller = (route: string = '') => (target: any) =>
{
    apiManager.httpControllersCatalog[target.name] = route;
};

export const httpGet = (url: string = '', contentType: ContentType = ContentType.Data) => (target: any, key: string) =>
{
    const className = target.constructor.name;
    if (!apiManager.httpMethodsCatalog[className])
    {
        apiManager.httpMethodsCatalog[className] = [];
    }

    apiManager.httpMethodsCatalog[className].push({
        name: key,
        argTypes: getMethodArgTypesData(target, key),
        url,
        httpType: HttpMethods.Get,
        contentType
    });
};

export const httpPost = (url: string = '') => (target: any, key: string) =>
{
    const className = target.constructor.name;
    if (!apiManager.httpMethodsCatalog[className])
    {
        apiManager.httpMethodsCatalog[className] = [];
    }

    apiManager.httpMethodsCatalog[className].push({
        name: key,
        argTypes: getMethodArgTypesData(target, key),
        url,
        httpType: HttpMethods.Post,
        contentType: ContentType.Data
    });
};

export const httpPut = (url: string = '') => (target: any, key: string) =>
{
    const className = target.constructor.name;
    if (!apiManager.httpMethodsCatalog[className])
    {
        apiManager.httpMethodsCatalog[className] = [];
    }

    apiManager.httpMethodsCatalog[className].push({
        name: key,
        argTypes: getMethodArgTypesData(target, key),
        url,
        httpType: HttpMethods.Put,
        contentType: ContentType.Data
    });
};

export const httpPatch = (url: string = '') => (target: any, key: string) =>
{
    const className = target.constructor.name;
    if (!apiManager.httpMethodsCatalog[className])
    {
        apiManager.httpMethodsCatalog[className] = [];
    }

    apiManager.httpMethodsCatalog[className].push({
        name: key,
        argTypes: getMethodArgTypesData(target, key),
        url,
        httpType: HttpMethods.Patch,
        contentType: ContentType.Data
    });
};

export const httpDelete = (url: string = '') => (target: any, key: string) =>
{
    const className = target.constructor.name;
    if (!apiManager.httpMethodsCatalog[className])
    {
        apiManager.httpMethodsCatalog[className] = [];
    }

    apiManager.httpMethodsCatalog[className].push({
        name: key,
        argTypes: getMethodArgTypesData(target, key),
        url,
        httpType: HttpMethods.Delete,
        contentType: ContentType.Data
    });
};

export const fromBody = (target: any, key: string, index: number) =>
{
    if (apiManager.httpBodyParamsCatalog.filter(e => e.className === target.constructor.name && e.methodName === key).length > 0)
    {
        throw new Error('Only one \'fromBody\' parameter decorator is allowed per function');
    }

    apiManager.httpBodyParamsCatalog.push({ className: target.constructor.name, methodName: key, bodyParamIndex: index });
};

const getMethodArgTypesData = (target: any, key: string): Array<string> =>
{
    const argTypesData = Reflect.getMetadata('design:paramtypes', target, key) as Array<(...args: any[]) => any>;
    return argTypesData ? argTypesData.map(t => t.name) : new Array<string>();
};
