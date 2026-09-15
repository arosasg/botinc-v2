import {dirname,basename} from 'node:path';
import { Template, defaultBuildLogger } from 'e2b';
const binary=process.env.BOTINC_RUNTIME_BINARY;
if(!binary||!process.env.E2B_API_KEY)throw new Error('BOTINC_RUNTIME_BINARY and E2B_API_KEY are required');
try {
const template=Template({fileContextPath:dirname(binary)}).fromImage('node:22-bookworm-slim')
 .setUser('root')
 .aptInstall(['git','gh','ripgrep','ca-certificates','curl','python3','make','g++'])
 .runCmd('npm install -g @anthropic-ai/claude-code@2.1.270 @openai/codex@0.154.0 @deepseek-ai/dsh@0.1.5-rc.1 pnpm@10.34.5')
 .runCmd('curl -fsSL https://go.dev/dl/go1.26.0.linux-amd64.tar.gz | tar -xz -C /usr/local && ln -s /usr/local/go/bin/go /usr/local/bin/go && ln -s /usr/local/go/bin/gofmt /usr/local/bin/gofmt')
 .copy(basename(binary),'/usr/local/bin/botinc-runtime',{mode:0o755,user:'root'})
 .setUser('node').setWorkdir('/home/node');
const build=await Template.build(template,'botinc-v2-runtime',{cpuCount:2,memoryMB:4096,onBuildLogs:defaultBuildLogger()});
console.log(JSON.stringify({templateID:build.templateId,buildID:build.buildId}));

} catch(error) {console.error(error.name,error.message);process.exitCode=1;}
