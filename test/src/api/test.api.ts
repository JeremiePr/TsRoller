import { Controller, controller, httpGet, httpPost, httpPut, httpDelete, fromBody, httpPatch } from '../../../src/lib/api-interface';

@controller('api/Test')
export class TestApi implements Controller
{
    @httpGet('foo/:param1/bar/:param2')
    public get1(param1: number, param2: string, param3: string): any
    {
        return { param1, param2, param3 };
    }

    @httpGet('id/:id')
    public get2(id: number, language: string): any
    {
        return { id, language }
    }

    @httpPost(':param1')
    public post1(param1: number, param2: string, @fromBody body: any): any
    {
        return { param1, param2, body };
    }

    @httpPut(':param1')
    public put1(param1: number, @fromBody body: any): any
    {
        return { param1, body };
    }

    @httpPatch('foo/bar/baz/:id')
    public patch1(id: number, @fromBody body: any): any
    {
        return { id, body };
    }

    @httpDelete('foo/bar/:id')
    public delete1(id: number): any
    {
        return { id };
    }
}