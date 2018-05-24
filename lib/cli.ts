#!/usr/bin/env node

import * as codegen from 'apollo-codegen';
import * as yargs from 'yargs';
import * as path from 'path';

process.on('unhandledRejection', (error) => { throw error });
process.on('uncaughtException' as any, handleError);
function handleError(error: string) { console.error(error); process.exit(1); }

yargs
    .command(
        'fetch-mutations <url>',
        'Generate typings, and JSON Schema from GraphQL endpoint',
        {
            output: {
                demand: true,
                describe: 'Output path for GraphQL schema file',
                default: 'schema.json',
                normalize: true,
                coerce: path.resolve,
            },
            header: {
                alias: 'H',
                describe: 'Additional header to send to the server as part of the introspection query request',
                type: 'array',
                coerce: (arg) => {
                    let additionalHeaders: { [k: string]: string } = {};
                    for (const header of arg) {
                        const separator = header.indexOf(":");
                        const name = header.substring(0, separator).trim();
                        const value = header.substring(separator + 1).trim();
                        if (!(name && value)) {
                            throw new Error('Headers should be specified as "Name: Value"');
                        }
                        additionalHeaders[name] = value;
                    }
                    return additionalHeaders;
                }
            },
            insecure: {
                alias: 'K',
                describe: 'Allows "insecure" SSL connection to the server',
                type: 'boolean'
            },
            method: {
                demand: false,
                describe: 'The HTTP request method to use for the introspection query request',
                type: 'string',
                default: 'POST',
                choices: ['POST', 'GET', 'post', 'get']
            }
        },
        async argv => {
            const { url, output, header, insecure, method } = argv;

            console.log('[1/1] downloadSchema ...');
            await codegen.downloadSchema(url, output, header, insecure, method);
            console.log('[2/2] generate mutations enum type ...');
        }
    )
    .fail(function (message, error) {
        handleError(message);
    })
    .help()
    .version()
    .strict()
    .argv;
