OUT = ray-example
CC = g++
CFLAGS = -g
INCFLAGS = -I./
OBJDIR = obj
SRCDIR = src
BINDIR = bin
OUTPUTDIR = output
RM = /bin/rm -f
_OBJS = ray-example.o
OBJS = $(patsubst %,$(OBJDIR)/%,$(_OBJS))




$(OBJDIR)/%.o: $(SRCDIR)/%.cpp
	$(CC) -c $(INCFLAGS) -o $@ $< $(CFLAGS)


$(BINDIR)/$(OUT): $(OBJS) 
	$(CC) $(CFLAGS) -o $(BINDIR)/$(OUT) $(OBJS)


.PHONY: clean
clean:
	$(RM) -f $(OBJDIR)/*.o $(OBJDIR)/*.obj $(BINDIR)/*.pdb $(BINDIR)/*.ilk $(BINDIR)/$(OUT) $(BINDIR)/*.exe


all: $(BINDIR)/$(OUT)


run: $(BINDIR)/$(OUT)
	$(BINDIR)/$(OUT) > $(OUTPUTDIR)/$(OUT).ppm