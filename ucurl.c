/*
 * LD_PRELOAD wrapper which tricks curl (or anything else) into connecting to a unix domain socket
 *
 * Compile: gcc -o ucurl.so -shared ucurl.c -ldl -fPIC
 * Usage:   LD_PRELOAD=/path/to/ucurl.so SOCKET=/path/to/socket curl http://0.0.0.0/
 */

#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <stdio.h>
#include <stdlib.h>

#define __USE_GNU
#include <dlfcn.h>

int socket(int domain, int type, int protocol) {
    static int (*socket_real)(int domain, int type, int protocol) = NULL;

    if (!socket_real) {
        socket_real = dlsym(RTLD_NEXT, "socket");
    }

    if (domain == AF_INET) {
        domain = AF_UNIX;
        protocol = 0;
    }

    return socket_real(domain, type, protocol);
}

int connect(int sockfd, const struct sockaddr *serv_addr, socklen_t addrlen) {
    static int (*connect_real)(int, const struct sockaddr*, socklen_t) = NULL;
    struct sockaddr_un unix_addr;

    if (!connect_real) {
        connect_real = dlsym(RTLD_NEXT, "connect");
    }

    if (serv_addr->sa_family == AF_INET) {
        unix_addr.sun_family = AF_UNIX;
        char *sockpath = getenv("SOCKET");
        if (!sockpath) {
            fprintf(stderr, "ucurl: SOCKET environment variable must be set\n");
            exit(1);
        }
        strncpy(unix_addr.sun_path, sockpath, sizeof(unix_addr.sun_path));
        unix_addr.sun_path[sizeof(unix_addr.sun_path) - 1] = '\0';
        addrlen = strlen(unix_addr.sun_path) + sizeof(unix_addr.sun_family);
        serv_addr = (const struct sockaddr *)&unix_addr;
    }

    return connect_real(sockfd, serv_addr, addrlen);
}
