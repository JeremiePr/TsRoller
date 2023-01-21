import { ApiManager } from '../../src/lib/api-manager';
import { TestApi } from './api/test.api';
import { WebClient } from '@jeje-devs/web-client';
import { Server } from 'http';

const port = 3071;
const baseApiTestRoute = `http://localhost:${port}/api/Test`;

ApiManager.run(port, async server => await runTests(server), _ => { }, [new TestApi()]);

async function runTests(server: Server): Promise<void>
{
    for (const method of testMethods)
    {
        await method();
    }
    console.log("All tests ran successfully!");
    server.close();
}

function assert(predicate: () => boolean): void
{
    if (!predicate())
    {
        throw new Error('Test failed');
    }
}

const testMethods: Array<() => Promise<void>> = [

    async () =>
    {
        const expected = { param1: 14, param2: 'hello', param3: 'baz' };
        const actual = await WebClient.get<any>(baseApiTestRoute + '/foo/14/bar/hello?param3=baz');

        assert(() => Object.keys(actual).length === Object.keys(expected).length);
        assert(() => actual.param1 === expected.param1);
        assert(() => actual.param2 === expected.param2);
        assert(() => actual.param3 === expected.param3);
    },

    async () =>
    {
        const expected = { id: 7840, language: 'fr-CH' };
        const actual = await WebClient.get<any>(baseApiTestRoute + '/id/7840?language=fr-CH');

        assert(() => Object.keys(actual).length === Object.keys(expected).length);
        assert(() => actual.id === expected.id);
        assert(() => actual.language === expected.language);
    },

    async () =>
    {
        const expected = { param1: 45, param2: 'Hola', body: { id: 12, name: 'FooBar' } };
        const actual = await WebClient.post<any>(baseApiTestRoute + '/45?param2=Hola', { id: 12, name: 'FooBar' });

        assert(() => Object.keys(actual).length === Object.keys(expected).length);
        assert(() => actual.param1 === expected.param1);
        assert(() => actual.param2 === expected.param2);
        assert(() => Object.keys(actual.body).length === Object.keys(expected.body).length);
        assert(() => actual.body.id === expected.body.id);
        assert(() => actual.body.name === expected.body.name);
    },

    async () =>
    {
        const expected = { param1: 2, body: { boo: true, val: 'Here' } };
        const actual = await WebClient.put<any>(baseApiTestRoute + '/2', { boo: true, val: 'Here' });

        assert(() => Object.keys(actual).length === Object.keys(expected).length);
        assert(() => actual.param1 === expected.param1);
        assert(() => Object.keys(actual.body).length === Object.keys(expected.body).length);
        assert(() => actual.body.boo === expected.body.boo);
        assert(() => actual.body.val === expected.body.val);
    },

    async () =>
    {
        const expected = { id: 92, body: { name: 'Butter', ref: 'IGR0001' } };
        const actual = await WebClient.patch<any>(baseApiTestRoute + '/foo/bar/baz/92', { name: 'Butter', ref: 'IGR0001' });

        assert(() => Object.keys(actual).length === Object.keys(expected).length);
        assert(() => actual.id === expected.id);
        assert(() => Object.keys(actual.body).length === Object.keys(expected.body).length);
        assert(() => actual.body.name === expected.body.name);
        assert(() => actual.body.ref === expected.body.ref);
    },

    async () =>
    {
        const expected = { id: 7145 };
        const actual = await WebClient.delete<any>(baseApiTestRoute + '/foo/bar/7145');

        assert(() => Object.keys(actual).length === Object.keys(expected).length);
        assert(() => actual.id === expected.id);
    }
];