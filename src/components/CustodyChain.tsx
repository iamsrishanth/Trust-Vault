import { Block, validateBlock, getActionColor } from '@/lib/blockchain';
import { Card } from '@/components/ui/card';
import { Shield, CheckCircle, XCircle, FileCheck, ArrowDown } from 'lucide-react';
import { formatHash } from '@/lib/blockchain';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface CustodyChainProps {
  blocks: Block[];
  verified?: boolean;
}

export const CustodyChain = ({ blocks, verified = true }: CustodyChainProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Custody Chain
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${verified
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-500/10 text-red-600 dark:text-red-400'
          }`}>
          {verified ? (
            <>
              <CheckCircle className="h-4 w-4" />
              Chain Verified
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4" />
              Tampering Detected
            </>
          )}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No blocks in the custody chain yet.
        </div>
      ) : (
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-primary/20 to-transparent" />

          <div className="space-y-3">
            {blocks.map((block, index) => {
              const previousBlock = index > 0 ? blocks[index - 1] : undefined;
              const validation = validateBlock(block, previousBlock);
              const actionColor = getActionColor(block.action);

              return (
                <div key={block.id} className="relative animate-slide-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  {/* Node dot */}
                  <div className={`absolute left-4 top-4 h-5 w-5 rounded-full border-2 z-10 ${validation.valid
                      ? 'bg-primary border-primary shadow-md'
                      : 'bg-destructive border-destructive shadow-md'
                    }`}>
                    <div className="absolute inset-1 rounded-full bg-white dark:bg-background" />
                  </div>

                  <Card className={`ml-12 p-4 shadow-card hover:shadow-elevated transition-all duration-300 group ${!validation.valid ? 'border-destructive/50 bg-destructive/5' : ''
                    }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Header */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            Block #{index + 1}
                          </span>
                          <span className={`text-sm font-semibold ${actionColor}`}>
                            {block.action}
                          </span>
                          {!validation.valid && (
                            <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                              ⚠ Invalid
                            </span>
                          )}
                        </div>

                        {/* Transfer info */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium bg-secondary px-2 py-0.5 rounded">{block.from}</span>
                          <ArrowDown className="h-3 w-3 text-muted-foreground rotate-[-90deg]" />
                          <span className="font-medium bg-secondary px-2 py-0.5 rounded">{block.to}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {new Date(block.timestamp).toLocaleString()}
                          </span>
                        </div>

                        {/* Hash info */}
                        <div className="space-y-1 pt-2 border-t border-border/50">
                          <div className="flex items-center gap-2 text-xs">
                            <FileCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">File Hash:</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <code className="bg-muted px-2 py-0.5 rounded font-mono cursor-help hover:bg-primary/10 transition-colors">
                                  {formatHash(block.fileHash)}
                                </code>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-md font-mono text-xs break-all">
                                {block.fileHash}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground ml-5">Previous:</span>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <code className="bg-muted px-2 py-0.5 rounded font-mono cursor-help hover:bg-primary/10 transition-colors">
                                  {block.previousHash === '0' ? 'GENESIS' : formatHash(block.previousHash)}
                                </code>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-md font-mono text-xs break-all">
                                {block.previousHash}
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          {block.signature && (
                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-muted-foreground ml-5">Signature:</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <code className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-mono cursor-help">
                                    {formatHash(block.signature)}
                                  </code>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-md font-mono text-xs break-all">
                                  {block.signature}
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
