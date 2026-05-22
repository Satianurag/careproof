# Orbit Wars v5 build.
#
# Targets:
#   make           - build submission/liboworbit.so (release)
#   make clean     - remove build artifacts
#   make tarball   - build + package main.py + .so into submission_v5.tar.gz
#   make debug     - debug build with sanitizers (for dev use only)

CXX ?= g++
CXXSTD ?= -std=c++17

SRCDIR = src
BUILDDIR = build
SUBMISSION = submission

SRCS = \
    $(SRCDIR)/ow_step.cpp \
    $(SRCDIR)/ow_intercept.cpp \
    $(SRCDIR)/ow_timeline.cpp \
    $(SRCDIR)/ow_eval.cpp \
    $(SRCDIR)/ow_decide.cpp \
    $(SRCDIR)/ow_capi.cpp

OBJS = $(patsubst $(SRCDIR)/%.cpp,$(BUILDDIR)/%.o,$(SRCS))

WARN = -Wall -Wextra -Wpedantic -Werror=return-type -Wno-unused-parameter
RELEASE_CXXFLAGS = $(CXXSTD) $(WARN) -O3 -fPIC -fvisibility=hidden \
                   -ffast-math -fno-math-errno -fno-trapping-math \
                   -funroll-loops -DNDEBUG \
                   -static-libstdc++ -static-libgcc
DEBUG_CXXFLAGS = $(CXXSTD) $(WARN) -O0 -g -fPIC -fsanitize=address,undefined

CXXFLAGS ?= $(RELEASE_CXXFLAGS)
LDFLAGS ?=

LIB = $(SUBMISSION)/liboworbit.so

.PHONY: all clean tarball debug

all: $(LIB)

$(LIB): $(OBJS) | $(SUBMISSION)
	$(CXX) $(CXXFLAGS) -shared -o $@ $(OBJS) $(LDFLAGS)

$(BUILDDIR)/%.o: $(SRCDIR)/%.cpp | $(BUILDDIR)
	$(CXX) $(CXXFLAGS) -c -o $@ $<

$(BUILDDIR):
	mkdir -p $(BUILDDIR)

$(SUBMISSION):
	mkdir -p $(SUBMISSION)

clean:
	rm -rf $(BUILDDIR) $(SUBMISSION)/liboworbit.so

debug:
	$(MAKE) CXXFLAGS="$(DEBUG_CXXFLAGS)" all

tarball: $(LIB)
	cp main.py $(SUBMISSION)/main.py
	tar -czf submission_v5.tar.gz -C $(SUBMISSION) main.py liboworbit.so
	@echo "Built submission_v5.tar.gz ($(shell stat -c%s submission_v5.tar.gz 2>/dev/null || echo ?) bytes)"
