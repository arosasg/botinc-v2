// E2B templates are snapshots, not container entrypoints. Start the run only
// after creating the sandbox, with that run's environment on the process.
import { Sandbox } from 'e2b';
let input='';for await(const chunk of process.stdin){input+=chunk;if(input.length>1048576)throw new Error('launch request too large')}
const request=JSON.parse(input);let sandbox;
try{
 sandbox=await Sandbox.create(request.templateID,{apiKey:process.env.E2B_API_KEY,timeoutMs:request.timeout*1000,requestTimeoutMs:120000,metadata:request.metadata,allowInternetAccess:true});
 // Older template envd versions can start a background command successfully
 // while keeping the SDK command-start stream open. Launch through a short
 // foreground shell that detaches the runtime, then verify the child survived.
 // This makes the sandbox id available to the server immediately and prevents
 // a live run from being mislabeled as a three-minute provisioning timeout.
 const launch="nohup /usr/local/bin/botinc-runtime run >/tmp/botinc-runtime.log 2>&1 </dev/null & pid=$!; sleep 1; kill -0 $pid";
 await sandbox.commands.run(launch,{envs:request.envVars,timeoutMs:30000,requestTimeoutMs:60000});
 process.stdout.write(JSON.stringify({sandboxID:sandbox.sandboxId}));
}catch(error){if(sandbox)await sandbox.kill().catch(()=>{});console.error('Remote sandbox launch failed:',error instanceof Error?error.message:'provider error');process.exitCode=1}
