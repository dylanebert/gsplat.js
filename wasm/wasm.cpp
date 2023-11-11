#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>

extern "C"
{
    void calculateDepth(float *viewProj, float *fBuffer, uint32_t *depthBuffer, uint32_t *indices, int vertexCount)
    {
        int32_t minDepth = 0x7fffffff;
        int32_t maxDepth = 0x80000000;
        for (uint32_t i = 0; i < vertexCount; i++)
        {
            float f0 = viewProj[2] * fBuffer[3 * i + 0];
            float f1 = viewProj[6] * fBuffer[3 * i + 1];
            float f2 = viewProj[10] * fBuffer[3 * i + 2];
            int32_t depth = (f0 + f1 + f2) * 4096;
            depthBuffer[i] = depth;
            if (depth < minDepth)
            {
                minDepth = depth;
            }
            if (depth > maxDepth)
            {
                maxDepth = depth;
            }
        }

        const float depthInv = 1.0f / (maxDepth - minDepth);
        for (uint32_t i = 0; i < vertexCount; i++)
        {
            depthBuffer[i] = (depthBuffer[i] - minDepth) * depthInv * 0xffff;
            indices[i] = i;
        }
    }

    void radixSortPass(uint32_t *input, uint32_t *indices, uint32_t *sortedIndices, uint32_t *counts, uint32_t vertexCount, int bitOffset)
    {
        memset(counts, 0, 256 * sizeof(uint32_t));

        // Count occurrences of each bit pattern
        for (uint32_t i = 0; i < vertexCount; i++)
        {
            uint32_t bitPattern = (input[indices[i]] >> bitOffset) & 0xff;
            counts[bitPattern]++;
        }

        // Accumulate counts
        uint32_t total = 0;
        for (uint32_t i = 0; i < 256; i++)
        {
            uint32_t oldCount = counts[i];
            counts[i] = total;
            total += oldCount;
        }

        // Rearrange elements into output array
        for (uint32_t i = 0; i < vertexCount; i++)
        {
            uint32_t bitPattern = (input[indices[i]] >> bitOffset) & 0xff;
            sortedIndices[counts[bitPattern]++] = indices[i];
        }
    }
}
